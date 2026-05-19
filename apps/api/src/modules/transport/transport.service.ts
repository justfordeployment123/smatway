import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../../common/services/storage.service';
import { CreateTransportDto } from './dto/create-transport.dto';
import { SearchTransportDto } from './dto/search-transport.dto';
import { PaymentMethod, TransportStatus } from '@prisma/client';

/**
 * Derive the providers a transporter has configured for receiving payouts.
 * Travelers see this on each route card so they know which payment rails
 * will be available before they enter the booking flow. Pure read of the
 * existing User columns — no DB call.
 *
 *   PAYSTACK   → paystackRecipientCode is set (means we successfully
 *                created a Paystack transfer recipient + cached the code)
 *   FLUTTERWAVE → flwBankCode + flwBankAccountNumber are set (Flutterwave
 *                doesn't have a recipient concept, just bank + account)
 */
export function configuredPayoutProviders(transporter: {
  paystackRecipientCode?: string | null;
  flwBankCode?: string | null;
  flwBankAccountNumber?: string | null;
}): PaymentMethod[] {
  const out: PaymentMethod[] = [];
  if (transporter.paystackRecipientCode) out.push(PaymentMethod.PAYSTACK);
  if (transporter.flwBankCode && transporter.flwBankAccountNumber) out.push(PaymentMethod.FLUTTERWAVE);
  return out;
}

@Injectable()
export class TransportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  private async getTransporterStats(transporterId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { transporterId },
    });

    const completedRides = await this.prisma.booking.count({
      where: {
        transport: { transporterId },
        status: 'COMPLETED' as any,
      },
    });

    const avgRating = reviews.length > 0
      ? Math.round((reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

    return {
      averageRating: avgRating,
      totalCompletedRides: completedRides,
    };
  }

  async create(transporterId: string, dto: CreateTransportDto) {
    // One-active-route-per-transporter limit. A route counts as active
    // while it's status=ACTIVE AND the trip window hasn't closed yet
    // (maxReachDateTime > now) AND it's not in a "ran early" state
    // (which is: had bookings, all of them are now COMPLETED or
    // CANCELLED — the route effectively ran already).
    //
    // We check before the vehicle lookup so the error explains the right
    // reason (route limit, not vehicle issue) when both would fail.
    const candidates = await this.prisma.transport.findMany({
      where: {
        transporterId,
        status: TransportStatus.ACTIVE,
        maxReachDateTime: { gt: new Date() },
      },
      select: {
        id: true,
        departureCity: true,
        destinationCity: true,
        maxReachDateTime: true,
        bookings: { select: { status: true } },
      },
    });
    // A candidate counts as "still active" if it has zero bookings (open
    // for new ones) OR at least one booking still in flight. If every
    // booking is COMPLETED/CANCELLED we treat the route as effectively
    // done even though its time window is still open.
    const stillActive = candidates.find((t) => {
      if (t.bookings.length === 0) return true;
      return t.bookings.some(
        (b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED',
      );
    });
    if (stillActive) {
      const when = stillActive.maxReachDateTime.toLocaleString();
      throw new BadRequestException(
        `You already have an active route (${stillActive.departureCity} → ${stillActive.destinationCity}, ends ${when}). Wait for it to end or delete it before creating another.`,
      );
    }

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    if (vehicle.transporterId !== transporterId) throw new ForbiddenException('Vehicle does not belong to you');

    // Fallback currency resolution: DTO → transporter's preferredCurrency → USD
    let currency = (dto.currency || '').toUpperCase();
    if (!currency) {
      const transporter = await this.prisma.user.findUnique({
        where: { id: transporterId },
        select: { preferredCurrency: true },
      });
      currency = (transporter?.preferredCurrency || 'USD').toUpperCase();
    }

    // Group-ride threshold validation. minSeatsToConfirm must be ≤ capacity
    // (= availableSeats at create time), otherwise the threshold is
    // unreachable and the trip would be permanently stuck "filling".
    let minSeatsToConfirm: number | null = null;
    if (dto.minSeatsToConfirm != null) {
      if (dto.minSeatsToConfirm < 1) {
        throw new BadRequestException('Minimum seats must be at least 1');
      }
      if (dto.minSeatsToConfirm > dto.availableSeats) {
        throw new BadRequestException(
          'Minimum seats cannot exceed the route capacity',
        );
      }
      minSeatsToConfirm = dto.minSeatsToConfirm;
    }

    return this.prisma.transport.create({
      data: {
        transporterId,
        vehicleId: dto.vehicleId,
        departureCountry: dto.departureCountry,
        departureCity: dto.departureCity,
        destinationCountry: dto.destinationCountry,
        destinationCity: dto.destinationCity,
        transportType: vehicle.transportType,
        price: dto.price,
        currency,
        availableSeats: dto.availableSeats,
        departureDateTime: new Date(dto.departureDateTime),
        maxReachDateTime: new Date(dto.maxReachDateTime),
        minSeatsToConfirm,
        autoConfirmOnFill: dto.autoConfirmOnFill ?? false,
      },
      include: { vehicle: true },
    });
  }

  async search(dto: SearchTransportDto) {
    const now = new Date();
    // status=ACTIVE excludes both transporter-soft-deleted routes (set to
    // INACTIVE by deleteByVehicle) and FULL routes that can't accept more
    // bookings. departureDateTime>=now drops trips whose departure is already
    // in the past — once a trip has left, there's nothing to book, so showing
    // it on the search page is just visual noise.
    const where: any = {
      status: TransportStatus.ACTIVE,
      departureDateTime: { gte: now },
      maxReachDateTime: { gte: now },
    };

    if (dto.departureCity) where.departureCity = { contains: dto.departureCity, mode: 'insensitive' };
    if (dto.departureCountry) where.departureCountry = { contains: dto.departureCountry, mode: 'insensitive' };
    if (dto.destinationCity) where.destinationCity = { contains: dto.destinationCity, mode: 'insensitive' };
    if (dto.destinationCountry) where.destinationCountry = { contains: dto.destinationCountry, mode: 'insensitive' };
    if (dto.transportType) where.transportType = dto.transportType;

    // Prefer `from`/`to` (full ISO timestamps already converted to UTC by the
    // client to represent the user's local-day boundary). Falls back to the
    // legacy `date` param, which treats the day as a UTC window — that
    // mis-matches routes departing right after local midnight in non-UTC
    // timezones (e.g. a Karachi route at 04:01 PKT lives on the prior UTC day).
    if (dto.from || dto.to) {
      const fromDate = dto.from ? new Date(dto.from) : null;
      const toDate = dto.to ? new Date(dto.to) : null;
      where.departureDateTime = {
        ...(fromDate ? { gte: fromDate > now ? fromDate : now } : {}),
        ...(toDate ? { lt: toDate } : {}),
      };
    } else if (dto.date) {
      const dayStart = new Date(dto.date);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      where.departureDateTime = {
        gte: dayStart > now ? dayStart : now,
        lt: dayEnd,
      };
    }

    const transports = await this.prisma.transport.findMany({
      where,
      include: {
        // Payout-config fields (paystackRecipientCode + flwBank*) drive
        // the per-route "configured providers" badges shown to travelers
        // so they can see which payment options will be available BEFORE
        // they click into the booking flow.
        transporter: {
          select: {
            id: true, name: true, phoneNumber: true, profileImageUrl: true, avatarUrl: true,
            paystackRecipientCode: true,
            flwBankCode: true,
            flwBankAccountNumber: true,
          },
        },
        vehicle: { select: { id: true, name: true, model: true, transportType: true, plateNumber: true, imageUrl: true } },
      },
      orderBy: { departureDateTime: 'asc' },
    });

    // Batch the filled-seat counts so the route cards can render the
    // group-ride progress meter without N+1 aggregates.
    const filledMap = await this.filledSeatsByTransport(transports.map((t) => t.id));

    return Promise.all(
      transports.map(async (transport: any) => {
        const stats = await this.getTransporterStats(transport.transporterId);
        const payoutProviders = configuredPayoutProviders(transport.transporter);
        // Strip the raw payout fields before returning — travelers only
        // need the derived array, not the recipient codes / bank numbers.
        const {
          paystackRecipientCode: _p,
          flwBankCode: _f1,
          flwBankAccountNumber: _f2,
          ...safeTransporter
        } = transport.transporter as any;
        return {
          ...transport,
          filledSeats: filledMap.get(transport.id) ?? 0,
          payoutProviders,
          transporter: {
            ...safeTransporter,
            profileImageUrl: await this.storageService.resolveImageUrl(safeTransporter.profileImageUrl || safeTransporter.avatarUrl),
            ...stats,
          },
          vehicle: transport.vehicle
            ? {
                ...transport.vehicle,
                imageUrl: await this.storageService.resolveImageUrl(transport.vehicle.imageUrl),
              }
            : null,
        };
      }),
    );
  }

  /** Sum of non-cancelled seats per transport. Drives the group-ride meter. */
  private async filledSeatsByTransport(transportIds: string[]): Promise<Map<string, number>> {
    if (transportIds.length === 0) return new Map();
    const rows = await this.prisma.booking.groupBy({
      by: ['transportId'],
      where: {
        transportId: { in: transportIds },
        status: { not: 'CANCELLED' },
      },
      _sum: { seatsBooked: true },
    });
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.transportId, r._sum.seatsBooked ?? 0);
    for (const id of transportIds) if (!map.has(id)) map.set(id, 0);
    return map;
  }

  async findOne(id: string) {
    const transport = await this.prisma.transport.findUnique({
      where: { id },
      include: {
        transporter: {
          select: {
            id: true, name: true, phoneNumber: true, profileImageUrl: true, avatarUrl: true,
            paystackRecipientCode: true,
            flwBankCode: true,
            flwBankAccountNumber: true,
          },
        },
        vehicle: { select: { id: true, name: true, model: true, transportType: true, plateNumber: true, imageUrl: true } },
      },
    });
    if (!transport) throw new NotFoundException('Transport not found');

    const stats = await this.getTransporterStats(transport.transporterId);
    const filledMap = await this.filledSeatsByTransport([transport.id]);
    const payoutProviders = configuredPayoutProviders(transport.transporter);
    const {
      paystackRecipientCode: _p,
      flwBankCode: _f1,
      flwBankAccountNumber: _f2,
      ...safeTransporter
    } = transport.transporter as any;

    return {
      ...transport,
      filledSeats: filledMap.get(transport.id) ?? 0,
      payoutProviders,
      transporter: {
        ...safeTransporter,
        profileImageUrl: await this.storageService.resolveImageUrl(safeTransporter.profileImageUrl),
        ...stats,
      },
      vehicle: transport.vehicle
        ? {
            ...transport.vehicle,
            imageUrl: await this.storageService.resolveImageUrl(transport.vehicle.imageUrl),
          }
        : null,
    };
  }

  async myRoutes(transporterId: string) {
    const transports = await this.prisma.transport.findMany({
      where: { transporterId },
      include: { vehicle: true, _count: { select: { bookings: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const stats = await this.getTransporterStats(transporterId);
    // Same group-ride meter the traveler sees, surfaced on the transporter's
    // own routes page so they can track fill progress at a glance.
    const filledMap = await this.filledSeatsByTransport(transports.map((t) => t.id));
    // Per-status booking counts per route. Drives the routes page bucket
    // logic — a route should fall out of "Upcoming" once every booking on
    // it is COMPLETED or CANCELLED, even if the route's time window is
    // still technically open. _count.bookings alone (returned above)
    // counts every status indiscriminately, so it can't tell us whether
    // anything is still active.
    const bookingStatsMap = await this.bookingStatsByTransport(transports.map((t) => t.id));

    return Promise.all(
      transports.map(async (transport: any) => ({
        ...transport,
        filledSeats: filledMap.get(transport.id) ?? 0,
        bookingStats: bookingStatsMap.get(transport.id) ?? {
          pending: 0, confirmed: 0, inProgress: 0, completed: 0, cancelled: 0,
        },
        transporterStats: stats,
        vehicle: transport.vehicle
          ? {
              ...transport.vehicle,
              imageUrl: await this.storageService.resolveImageUrl(transport.vehicle.imageUrl),
            }
          : null,
      })),
    );
  }

  /**
   * Per-route booking counts grouped by status. One groupBy hits the DB
   * for the whole list — avoids N+1 across the routes page. Routes with
   * zero bookings get a zeroed entry so the frontend can read every key
   * without null-checks.
   */
  private async bookingStatsByTransport(transportIds: string[]): Promise<Map<string, {
    pending: number; confirmed: number; inProgress: number; completed: number; cancelled: number;
  }>> {
    const map = new Map<string, { pending: number; confirmed: number; inProgress: number; completed: number; cancelled: number }>();
    for (const id of transportIds) {
      map.set(id, { pending: 0, confirmed: 0, inProgress: 0, completed: 0, cancelled: 0 });
    }
    if (transportIds.length === 0) return map;
    const rows = await this.prisma.booking.groupBy({
      by: ['transportId', 'status'],
      where: { transportId: { in: transportIds } },
      _count: { _all: true },
    });
    for (const r of rows) {
      const stat = map.get(r.transportId);
      if (!stat) continue;
      const n = r._count._all;
      switch (r.status) {
        case 'PENDING': stat.pending = n; break;
        case 'CONFIRMED': stat.confirmed = n; break;
        case 'IN_PROGRESS': stat.inProgress = n; break;
        case 'COMPLETED': stat.completed = n; break;
        case 'CANCELLED': stat.cancelled = n; break;
      }
    }
    return map;
  }

  async update(id: string, transporterId: string, dto: Partial<CreateTransportDto>) {
    const transport = await this.prisma.transport.findUnique({ where: { id } });
    if (!transport) throw new NotFoundException('Transport not found');
    if (transport.transporterId !== transporterId) throw new ForbiddenException();

    let transportType: typeof transport.transportType | undefined;
    if (dto.vehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } });
      if (!vehicle || vehicle.transporterId !== transporterId) throw new ForbiddenException('Invalid vehicle');
      transportType = vehicle.transportType;
    }

    // Group-ride threshold sanity-check on edit. The cap to compare against
    // is the new availableSeats if it's being changed, otherwise the
    // existing value.
    if (dto.minSeatsToConfirm != null) {
      const cap = dto.availableSeats ?? transport.availableSeats;
      if (dto.minSeatsToConfirm < 1) {
        throw new BadRequestException('Minimum seats must be at least 1');
      }
      if (dto.minSeatsToConfirm > cap) {
        throw new BadRequestException(
          'Minimum seats cannot exceed the route capacity',
        );
      }
    }

    return this.prisma.transport.update({
      where: { id },
      data: {
        ...dto,
        transportType,
        departureDateTime: dto.departureDateTime ? new Date(dto.departureDateTime) : undefined,
        maxReachDateTime: dto.maxReachDateTime ? new Date(dto.maxReachDateTime) : undefined,
      },
    });
  }

  async remove(id: string, transporterId: string) {
    const transport = await this.prisma.transport.findUnique({ where: { id } });
    if (!transport) throw new NotFoundException('Transport not found');
    if (transport.transporterId !== transporterId) throw new ForbiddenException();
    return this.prisma.transport.delete({ where: { id } });
  }

  async deleteByVehicle(vehicleId: string, transporterId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    if (vehicle.transporterId !== transporterId) throw new ForbiddenException();

    return this.prisma.transport.updateMany({
      where: { vehicleId },
      data: { status: TransportStatus.INACTIVE },
    });
  }

  /**
   * Time-series + breakdowns for the transporter dashboard charts.
   * Mirrors the admin /admin/overview/insights shape so the same chart
   * primitives can be reused on the web side. All counts are scoped to
   * the authenticated transporter's routes; earnings come from the
   * Payout table (releasedAt timestamp) so the line tracks money that
   * actually landed in the transporter's bank.
   */
  async getInsights(transporterId: string, daysParam?: string) {
    const days = clampInsightsDays(daysParam);
    const start = startOfDayUtc(
      new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000),
    );
    const priorStart = startOfDayUtc(
      new Date(start.getTime() - days * 24 * 60 * 60 * 1000),
    );

    type DayRow = { day: Date; count: bigint };
    type RevRow = { day: Date; currency: string; total: string | number };

    const [
      bookingRows,
      paidBookingRows,
      completedBookingRows,
      earningsRows,
      statusRows,
      paymentRows,
      topRouteRows,
      priorBookings,
      priorPaidBookings,
      priorCompletedBookings,
      priorEarningsRows,
    ] = await Promise.all([
      this.prisma.$queryRaw<DayRow[]>`
        SELECT DATE_TRUNC('day', b."createdAt")::date AS day, COUNT(*)::bigint AS count
        FROM "Booking" b
        JOIN "Transport" t ON t."id" = b."transportId"
        WHERE t."transporterId" = ${transporterId} AND b."createdAt" >= ${start}
        GROUP BY day
        ORDER BY day ASC
      `,
      this.prisma.$queryRaw<DayRow[]>`
        SELECT DATE_TRUNC('day', b."createdAt")::date AS day, COUNT(*)::bigint AS count
        FROM "Booking" b
        JOIN "Transport" t ON t."id" = b."transportId"
        WHERE t."transporterId" = ${transporterId}
          AND b."paymentStatus" = 'PAID'
          AND b."createdAt" >= ${start}
        GROUP BY day
        ORDER BY day ASC
      `,
      this.prisma.$queryRaw<DayRow[]>`
        SELECT DATE_TRUNC('day', b."createdAt")::date AS day, COUNT(*)::bigint AS count
        FROM "Booking" b
        JOIN "Transport" t ON t."id" = b."transportId"
        WHERE t."transporterId" = ${transporterId}
          AND b."status" = 'COMPLETED'
          AND b."createdAt" >= ${start}
        GROUP BY day
        ORDER BY day ASC
      `,
      this.prisma.$queryRaw<RevRow[]>`
        SELECT DATE_TRUNC('day', "releasedAt")::date AS day,
               "currency" AS currency,
               SUM("netAmount")::numeric AS total
        FROM "Payout"
        WHERE "transporterId" = ${transporterId}
          AND "status" = 'RELEASED'
          AND "releasedAt" >= ${start}
        GROUP BY day, currency
        ORDER BY day ASC
      `,
      this.prisma.booking.groupBy({
        by: ['status'],
        where: { transport: { transporterId } },
        _count: { _all: true },
      }),
      this.prisma.booking.groupBy({
        by: ['paymentStatus'],
        where: { transport: { transporterId } },
        _count: { _all: true },
      }),
      this.prisma.booking.groupBy({
        by: ['transportId'],
        where: { transport: { transporterId } },
        _count: { _all: true },
        orderBy: { _count: { transportId: 'desc' } },
        take: 5,
      }),
      this.prisma.booking.count({
        where: {
          transport: { transporterId },
          createdAt: { gte: priorStart, lt: start },
        },
      }),
      this.prisma.booking.count({
        where: {
          transport: { transporterId },
          paymentStatus: 'PAID',
          createdAt: { gte: priorStart, lt: start },
        },
      }),
      this.prisma.booking.count({
        where: {
          transport: { transporterId },
          status: 'COMPLETED',
          createdAt: { gte: priorStart, lt: start },
        },
      }),
      this.prisma.$queryRaw<Array<{ currency: string; total: string | number }>>`
        SELECT "currency" AS currency,
               SUM("netAmount")::numeric AS total
        FROM "Payout"
        WHERE "transporterId" = ${transporterId}
          AND "status" = 'RELEASED'
          AND "releasedAt" >= ${priorStart}
          AND "releasedAt" < ${start}
        GROUP BY currency
      `,
    ]);

    const bookingsByDay = new Map<string, number>();
    for (const r of bookingRows) bookingsByDay.set(toIsoDate(r.day), Number(r.count));

    const paidByDay = new Map<string, number>();
    for (const r of paidBookingRows) paidByDay.set(toIsoDate(r.day), Number(r.count));

    const completedByDay = new Map<string, number>();
    for (const r of completedBookingRows)
      completedByDay.set(toIsoDate(r.day), Number(r.count));

    const earningsByDay = new Map<string, Record<string, number>>();
    for (const r of earningsRows) {
      const key = toIsoDate(r.day);
      const bucket = earningsByDay.get(key) ?? {};
      bucket[r.currency] = (bucket[r.currency] ?? 0) + Number(r.total);
      earningsByDay.set(key, bucket);
    }

    const priorEarningsByCurrency: Record<string, number> = {};
    for (const r of priorEarningsRows) {
      priorEarningsByCurrency[r.currency] =
        (priorEarningsByCurrency[r.currency] ?? 0) + Number(r.total);
    }

    const series: Array<{
      date: string;
      bookings: number;
      paidBookings: number;
      completedBookings: number;
      earningsByCurrency: Record<string, number>;
    }> = [];
    for (let i = 0; i < days; i++) {
      const d = startOfDayUtc(new Date(start.getTime() + i * 24 * 60 * 60 * 1000));
      const key = toIsoDate(d);
      series.push({
        date: key,
        bookings: bookingsByDay.get(key) ?? 0,
        paidBookings: paidByDay.get(key) ?? 0,
        completedBookings: completedByDay.get(key) ?? 0,
        earningsByCurrency: earningsByDay.get(key) ?? {},
      });
    }

    const transports = topRouteRows.length
      ? await this.prisma.transport.findMany({
          where: { id: { in: topRouteRows.map((r) => r.transportId) } },
          select: { id: true, departureCity: true, destinationCity: true },
        })
      : [];
    const transportMap = new Map(transports.map((t) => [t.id, t]));

    return {
      days,
      series,
      prior: {
        bookings: priorBookings,
        paidBookings: priorPaidBookings,
        completedBookings: priorCompletedBookings,
        earningsByCurrency: priorEarningsByCurrency,
      },
      statusBreakdown: statusRows.map((r) => ({
        status: r.status,
        count: r._count._all,
      })),
      paymentBreakdown: paymentRows.map((r) => ({
        paymentStatus: r.paymentStatus,
        count: r._count._all,
      })),
      topRoutes: topRouteRows
        .map((r) => {
          const t = transportMap.get(r.transportId);
          if (!t) return null;
          return {
            transportId: t.id,
            departureCity: t.departureCity,
            destinationCity: t.destinationCity,
            bookings: r._count._all,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    };
  }
}

function clampInsightsDays(raw: string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 14;
  return Math.min(90, Math.max(7, Math.floor(n)));
}

function startOfDayUtc(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
