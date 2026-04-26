import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JwtAdminAuthGuard } from './admin-auth.guard';
import { BookingStatus, PaymentStatus, TransportStatus } from '@prisma/client';

/**
 * Admin dashboard "overview" — high-level KPIs the home page needs without
 * requiring a granular permission. Only authentication, since these numbers
 * just summarise things any admin should see on landing.
 */
@Controller('admin/overview')
@UseGuards(JwtAdminAuthGuard)
export class AdminOverviewController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async overview() {
    const [
      totalUsers,
      travelers,
      transporters,
      activeRoutes,
      totalBookings,
      pendingBookings,
      completedBookings,
      paidBookings,
      siteFeedback,
      reviews,
      announcements,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { accountType: 'TRAVELER' } }),
      this.prisma.user.count({ where: { accountType: 'TRANSPORTER' } }),
      this.prisma.transport.count({ where: { status: TransportStatus.ACTIVE } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
      this.prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
      this.prisma.booking.count({ where: { paymentStatus: PaymentStatus.PAID } }),
      this.prisma.siteFeedback.count(),
      this.prisma.review.count(),
      this.prisma.announcement.count({ where: { isPublished: true } }),
    ]);

    const recentSignups = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        accountType: true,
        country: true,
        createdAt: true,
      },
    });

    const recentBookings = await this.prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        // ids included so the admin overview cards can link straight into
        // /dashboard/users/:id and /dashboard/routes/:id without an extra
        // fetch. Without these, the cards would show names that aren't
        // clickable.
        traveler: { select: { id: true, name: true } },
        transport: {
          select: {
            id: true,
            departureCity: true,
            destinationCity: true,
            currency: true,
          },
        },
      },
    });

    return {
      stats: {
        totalUsers,
        travelers,
        transporters,
        activeRoutes,
        totalBookings,
        pendingBookings,
        completedBookings,
        paidBookings,
        siteFeedback,
        reviews,
        publishedAnnouncements: announcements,
      },
      recentSignups,
      recentBookings,
    };
  }

  /**
   * Time-series + breakdowns for the dashboard charts. One round-trip so the
   * dashboard mounts with a single fetch in addition to /overview.
   *
   * Day buckets are UTC. Days with no activity are explicitly filled with
   * zeros server-side so the client chart renders a continuous line instead
   * of a gappy one.
   */
  @Get('insights')
  async insights(@Query('days') daysParam?: string) {
    const days = clampDays(daysParam);
    const start = startOfDayUtc(new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000));
    // Prior period of equal length, immediately preceding `start`. Used to
    // compute "vs prev N days" deltas in the chart-card summaries.
    const priorStart = startOfDayUtc(
      new Date(start.getTime() - days * 24 * 60 * 60 * 1000)
    );

    type DayRow = { day: Date; count: bigint };
    type RevRow = { day: Date; currency: string; total: string | number };

    const [
      bookingRows,
      signupRows,
      paidBookingRows,
      routeRows,
      revenueRows,
      statusRows,
      paymentRows,
      topRouteRows,
      priorBookings,
      priorSignups,
      priorPaidBookings,
      priorRoutes,
      priorRevenueRows,
    ] = await Promise.all([
      this.prisma.$queryRaw<DayRow[]>`
        SELECT DATE_TRUNC('day', "createdAt")::date AS day, COUNT(*)::bigint AS count
        FROM "Booking"
        WHERE "createdAt" >= ${start}
        GROUP BY day
        ORDER BY day ASC
      `,
      this.prisma.$queryRaw<DayRow[]>`
        SELECT DATE_TRUNC('day', "createdAt")::date AS day, COUNT(*)::bigint AS count
        FROM "User"
        WHERE "createdAt" >= ${start}
        GROUP BY day
        ORDER BY day ASC
      `,
      this.prisma.$queryRaw<DayRow[]>`
        SELECT DATE_TRUNC('day', "createdAt")::date AS day, COUNT(*)::bigint AS count
        FROM "Booking"
        WHERE "paymentStatus" = 'PAID' AND "createdAt" >= ${start}
        GROUP BY day
        ORDER BY day ASC
      `,
      this.prisma.$queryRaw<DayRow[]>`
        SELECT DATE_TRUNC('day', "createdAt")::date AS day, COUNT(*)::bigint AS count
        FROM "Transport"
        WHERE "createdAt" >= ${start}
        GROUP BY day
        ORDER BY day ASC
      `,
      this.prisma.$queryRaw<RevRow[]>`
        SELECT DATE_TRUNC('day', b."createdAt")::date AS day,
               t."currency" AS currency,
               SUM(b."totalPrice")::numeric AS total
        FROM "Booking" b
        JOIN "Transport" t ON t."id" = b."transportId"
        WHERE b."paymentStatus" = 'PAID' AND b."createdAt" >= ${start}
        GROUP BY day, currency
        ORDER BY day ASC
      `,
      this.prisma.booking.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.booking.groupBy({
        by: ['paymentStatus'],
        _count: { _all: true },
      }),
      this.prisma.booking.groupBy({
        by: ['transportId'],
        _count: { _all: true },
        orderBy: { _count: { transportId: 'desc' } },
        take: 5,
      }),
      this.prisma.booking.count({
        where: { createdAt: { gte: priorStart, lt: start } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: priorStart, lt: start } },
      }),
      this.prisma.booking.count({
        where: {
          paymentStatus: PaymentStatus.PAID,
          createdAt: { gte: priorStart, lt: start },
        },
      }),
      this.prisma.transport.count({
        where: { createdAt: { gte: priorStart, lt: start } },
      }),
      this.prisma.$queryRaw<Array<{ currency: string; total: string | number }>>`
        SELECT t."currency" AS currency,
               SUM(b."totalPrice")::numeric AS total
        FROM "Booking" b
        JOIN "Transport" t ON t."id" = b."transportId"
        WHERE b."paymentStatus" = 'PAID'
          AND b."createdAt" >= ${priorStart}
          AND b."createdAt" < ${start}
        GROUP BY currency
      `,
    ]);

    // Index raw rows by ISO date so we can fill missing days with 0s.
    const bookingsByDay = new Map<string, number>();
    for (const r of bookingRows) bookingsByDay.set(toIsoDate(r.day), Number(r.count));

    const signupsByDay = new Map<string, number>();
    for (const r of signupRows) signupsByDay.set(toIsoDate(r.day), Number(r.count));

    const paidByDay = new Map<string, number>();
    for (const r of paidBookingRows) paidByDay.set(toIsoDate(r.day), Number(r.count));

    const routesByDay = new Map<string, number>();
    for (const r of routeRows) routesByDay.set(toIsoDate(r.day), Number(r.count));

    const revenueByDay = new Map<string, Record<string, number>>();
    for (const r of revenueRows) {
      const key = toIsoDate(r.day);
      const bucket = revenueByDay.get(key) ?? {};
      bucket[r.currency] = (bucket[r.currency] ?? 0) + Number(r.total);
      revenueByDay.set(key, bucket);
    }

    const priorRevenueByCurrency: Record<string, number> = {};
    for (const r of priorRevenueRows) {
      priorRevenueByCurrency[r.currency] =
        (priorRevenueByCurrency[r.currency] ?? 0) + Number(r.total);
    }

    const series: Array<{
      date: string;
      bookings: number;
      signups: number;
      paidBookings: number;
      routesCreated: number;
      revenueByCurrency: Record<string, number>;
    }> = [];
    for (let i = 0; i < days; i++) {
      const d = startOfDayUtc(new Date(start.getTime() + i * 24 * 60 * 60 * 1000));
      const key = toIsoDate(d);
      series.push({
        date: key,
        bookings: bookingsByDay.get(key) ?? 0,
        signups: signupsByDay.get(key) ?? 0,
        paidBookings: paidByDay.get(key) ?? 0,
        routesCreated: routesByDay.get(key) ?? 0,
        revenueByCurrency: revenueByDay.get(key) ?? {},
      });
    }

    // Hydrate top route ids → city names so the client can render labels
    // without a second round-trip.
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
        signups: priorSignups,
        paidBookings: priorPaidBookings,
        routesCreated: priorRoutes,
        revenueByCurrency: priorRevenueByCurrency,
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

// ─── helpers ─────────────────────────────────────────────────────────────────

function clampDays(raw: string | undefined): number {
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
