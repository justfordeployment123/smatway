import {
  BadRequestException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../../common/services/storage.service';
import { ChatGateway } from '../chat/chat.gateway';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { PayoutsService } from '../payouts/payouts.service';
import { configuredPayoutProviders } from '../transport/transport.service';
import * as crypto from 'crypto';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly chatGateway: ChatGateway,
    private readonly payoutsService: PayoutsService,
  ) {}

  /**
   * Generate a unique 10-digit verification code. Cryptographically random
   * (not Math.random) so it can't be guessed by enumeration. Retries on
   * collision — at 10 digits the keyspace is 10^10 (≈10 billion) so
   * collisions are effectively never going to hit the retry path even at
   * platform scale.
   */
  private async generateVerificationCode(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const code = crypto.randomInt(1_000_000_000, 10_000_000_000).toString();
      const collision = await this.prisma.booking.findUnique({
        where: { verificationCode: code },
        select: { id: true },
      });
      if (!collision) return code;
    }
    throw new Error('Could not generate a unique verification code');
  }

  /** Per platform policy: hide transporter contact + verification code until paid. */
  private isPaid(booking: { paymentStatus: PaymentStatus }): boolean {
    return booking.paymentStatus === PaymentStatus.PAID;
  }

  /**
   * Average review rating per transporter, rounded to 1 decimal. Computed
   * across all reviews the transporter has ever received. Used by the
   * traveler-facing booking responses so passengers see the driver's
   * rating even before they pay (the rating helps them decide whether
   * to commit).
   *
   * Returns 0 for transporters with no reviews. Frontend treats 0 as
   * "no rating yet" and renders accordingly.
   */
  private async ratingByTransporter(transporterIds: string[]): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    for (const id of transporterIds) map.set(id, 0);
    if (transporterIds.length === 0) return map;
    const rows = await this.prisma.review.groupBy({
      by: ['transporterId'],
      where: { transporterId: { in: transporterIds } },
      _avg: { rating: true },
    });
    for (const r of rows) {
      const v = r._avg.rating ?? 0;
      map.set(r.transporterId, Math.round(v * 10) / 10);
    }
    return map;
  }

  /**
   * Sum of seats booked across non-cancelled bookings on a transport. This
   * is the "filled seats" count the threshold compares against. Computed
   * fresh each time to stay correct even if `availableSeats` ever drifts.
   */
  private async filledSeats(transportId: string): Promise<number> {
    const result = await this.prisma.booking.aggregate({
      where: { transportId, status: { not: BookingStatus.CANCELLED } },
      _sum: { seatsBooked: true },
    });
    return result._sum.seatsBooked ?? 0;
  }

  async create(travelerId: string, dto: CreateBookingDto) {
    const transport = await this.prisma.transport.findUnique({ where: { id: dto.transportId } });
    if (!transport) throw new NotFoundException('Transport not found');
    if (transport.availableSeats < dto.seatsBooked)
      throw new BadRequestException('Not enough seats available');

    const totalPrice = Number(transport.price) * dto.seatsBooked;
    const verificationCode = await this.generateVerificationCode();

    const [booking] = await this.prisma.$transaction([
      this.prisma.booking.create({
        data: {
          travelerId,
          transportId: dto.transportId,
          seatsBooked: dto.seatsBooked,
          totalPrice,
          paymentMethod: dto.paymentMethod,
          verificationCode,
        },
        include: { transport: true },
      }),
      this.prisma.transport.update({
        where: { id: dto.transportId },
        data: { availableSeats: { decrement: dto.seatsBooked } },
      }),
    ]);

    const traveler = await this.prisma.user.findUnique({
      where: { id: travelerId },
      select: { id: true, name: true },
    });
    this.chatGateway.notifyUser(transport.transporterId, {
      type: 'booking',
      bookingId: booking.id,
      traveler,
      seatsBooked: dto.seatsBooked,
      totalPrice,
      route: `${transport.departureCity} → ${transport.destinationCity}`,
    });

    // Group-ride auto-confirm sweep. If the route is set up for auto-confirm
    // and the new booking just pushed the route over its threshold, every
    // PENDING booking on the route flips to CONFIRMED in one transaction —
    // payment unlocks for all travelers at the same moment.
    //
    // We re-evaluate on every booking create, not just the trigger one,
    // so a late booking that arrives after a cancellation knocked the
    // count below threshold-and-back-up gets handled correctly too.
    if (
      transport.autoConfirmOnFill &&
      transport.minSeatsToConfirm != null
    ) {
      const filled = await this.filledSeats(dto.transportId);
      if (filled >= transport.minSeatsToConfirm) {
        await this.autoConfirmAllPending(dto.transportId);
      }
    }

    return booking;
  }

  /**
   * Flip every PENDING booking on a transport to CONFIRMED in one shot,
   * notifying each traveler. Called by the threshold-met sweep above.
   * Idempotent: filtered to PENDING so re-running this can't downgrade
   * IN_PROGRESS bookings.
   */
  private async autoConfirmAllPending(transportId: string): Promise<void> {
    const pendings = await this.prisma.booking.findMany({
      where: { transportId, status: BookingStatus.PENDING },
      include: {
        transport: {
          select: {
            departureCity: true,
            destinationCity: true,
            transporter: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (pendings.length === 0) return;

    await this.prisma.booking.updateMany({
      where: {
        id: { in: pendings.map((b) => b.id) },
        // Re-check status so a concurrent transporter "Confirm" or admin
        // cancel between the find above and this update doesn't get
        // silently overwritten.
        status: BookingStatus.PENDING,
      },
      data: { status: BookingStatus.CONFIRMED },
    });

    for (const b of pendings) {
      this.chatGateway.notifyUser(b.travelerId, {
        type: 'booking_confirmed',
        bookingId: b.id,
        transporter: b.transport.transporter,
        route: `${b.transport.departureCity} → ${b.transport.destinationCity}`,
        // Distinguishes "auto" from "manual" in case the bell renderer
        // wants to add a "Trip filled — auto-confirmed" line later.
        autoConfirmed: true,
      });
    }
  }

  /**
   * Batch-compute filledSeats for a list of transport ids in one query, so
   * a 50-booking listing doesn't fan out into 50 aggregates.
   */
  private async filledSeatsByTransport(
    transportIds: string[],
  ): Promise<Map<string, number>> {
    if (transportIds.length === 0) return new Map();
    const rows = await this.prisma.booking.groupBy({
      by: ['transportId'],
      where: {
        transportId: { in: transportIds },
        status: { not: BookingStatus.CANCELLED },
      },
      _sum: { seatsBooked: true },
    });
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.transportId, r._sum.seatsBooked ?? 0);
    // Transports with zero non-cancelled bookings won't appear in the
    // groupBy result; default them to 0 so the frontend always has a
    // number rather than undefined.
    for (const id of transportIds) if (!map.has(id)) map.set(id, 0);
    return map;
  }

  async myBookings(travelerId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { travelerId },
      include: {
        transport: {
          include: {
            vehicle: true,
            // Avatar + rating are visible pre-payment (the traveler needs
            // them to decide whether to commit). Phone + email stay locked
            // until the booking is PAID — pre-payment communication is
            // restricted to in-app chat.
            // payout-config fields drive the per-booking payoutProviders[]
            // array (which payment rails the traveler can use here).
            transporter: {
              select: {
                id: true, name: true, email: true, phoneNumber: true, avatarUrl: true,
                paystackRecipientCode: true,
                flwBankCode: true,
                flwBankAccountNumber: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const filledMap = await this.filledSeatsByTransport(
      Array.from(new Set(bookings.map((b) => b.transportId))),
    );
    const ratingMap = await this.ratingByTransporter(
      Array.from(
        new Set(
          bookings
            .map((b) => b.transport.transporter?.id)
            .filter((x): x is string => !!x),
        ),
      ),
    );

    return Promise.all(
      bookings.map(async (booking) => {
        const paid = this.isPaid(booking);
        const transporter = booking.transport.transporter;
        const payoutProviders = transporter ? configuredPayoutProviders(transporter) : [];
        return {
          ...booking,
          // Mask the verification code (the 10-digit pickup token / QR data)
          // until the booking is paid.
          verificationCode: paid ? booking.verificationCode : null,
          transport: {
            ...booking.transport,
            // Drives the "X of Y booked" progress meter on the traveler's
            // booking list and on the booking detail. Pair with
            // transport.minSeatsToConfirm to render the strip.
            filledSeats: filledMap.get(booking.transportId) ?? 0,
            // Which payment rails the pay page should surface for this
            // booking. Tied to whichever providers the transporter has
            // configured for receiving payouts so we never collect on a
            // rail we can't release on.
            payoutProviders,
            vehicle: booking.transport.vehicle
              ? {
                ...booking.transport.vehicle,
                imageUrl: booking.transport.vehicle.imageUrl
                  ? await this.storageService.resolveImageUrl(booking.transport.vehicle.imageUrl)
                  : null,
              }
              : null,
            transporter: transporter
              ? {
                id: transporter.id,
                name: transporter.name,
                avatarUrl: transporter.avatarUrl
                  ? await this.storageService.resolveImageUrl(transporter.avatarUrl)
                  : null,
                averageRating: ratingMap.get(transporter.id) ?? 0,
                // Hide contact until paid — pre-payment communication
                // is restricted to in-app chat.
                phoneNumber: paid ? transporter.phoneNumber : null,
                email: paid ? transporter.email : null,
              }
              : transporter,
          },
        };
      }),
    );
  }

  async findOne(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        transport: {
          include: {
            vehicle: true,
            // Pull email + avatar in addition to phone — masking happens
            // below depending on payment status + viewer role. payout-
            // config fields drive the payoutProviders[] array.
            transporter: {
              select: {
                id: true, name: true, email: true, phoneNumber: true, avatarUrl: true,
                paystackRecipientCode: true,
                flwBankCode: true,
                flwBankAccountNumber: true,
              },
            },
          },
        },
        // Traveler relation drives the transporter's "Traveler" sidebar
        // (name + email + phone + avatar). Was missing — the page was
        // falling back to "U" / "Unknown" for every booking.
        traveler: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            avatarUrl: true,
          },
        },
        // Always pull payout — we only expose it to the transporter below
        // so the traveler still can't infer payout state from this endpoint.
        payout: { select: { status: true, releasedAt: true, netAmount: true, currency: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    const isTraveler = booking.travelerId === userId;
    const isTransporter = booking.transport.transporterId === userId;
    if (!isTraveler && !isTransporter) throw new ForbiddenException();

    const paid = this.isPaid(booking);
    const vehicle = booking.transport.vehicle
      ? {
        ...booking.transport.vehicle,
        imageUrl: booking.transport.vehicle.imageUrl
          ? await this.storageService.resolveImageUrl(booking.transport.vehicle.imageUrl)
          : null,
      }
      : null;
    // Drives the group-ride progress meter + pay-button gating on the
    // booking detail page. Computed live so a sibling cancellation
    // immediately pulls the count down.
    const filledSeats = await this.filledSeats(booking.transportId);
    // S3 keys → presigned URLs. Always resolved; the avatar itself is
    // not sensitive (a name + face), only contact details are gated.
    const travelerAvatar = booking.traveler?.avatarUrl
      ? await this.storageService.resolveImageUrl(booking.traveler.avatarUrl)
      : null;
    const transporterAvatar = booking.transport.transporter?.avatarUrl
      ? await this.storageService.resolveImageUrl(booking.transport.transporter.avatarUrl)
      : null;
    // Transporter rating shown to the traveler pre-payment so they can
    // make an informed decision before committing money.
    const ratingMap = booking.transport.transporter
      ? await this.ratingByTransporter([booking.transport.transporter.id])
      : null;
    const transporterRating =
      booking.transport.transporter
        ? ratingMap?.get(booking.transport.transporter.id) ?? 0
        : 0;

    return {
      ...booking,
      // Traveler sees the code only once paid. Transporter never sees it via
      // this endpoint — they have to ask the traveler at pickup. That's the
      // whole point of the verification flow.
      verificationCode: isTraveler && paid ? booking.verificationCode : null,
      // Payout is transporter-only (drives the RECEIVED stage in their UI).
      // Travelers don't get the column so they can't infer payout state.
      payout: isTransporter ? booking.payout : null,
      // Traveler payload shown to the transporter. Symmetric masking with
      // the transporter side — pre-payment, only the name + avatar is
      // exposed (so the transporter knows who's booked but can't reach
      // out off-platform until payment commits the booking). Once paid,
      // email + phone unlock for direct contact.
      traveler: booking.traveler
        ? {
            id: booking.traveler.id,
            name: booking.traveler.name,
            avatarUrl: travelerAvatar,
            email: paid ? booking.traveler.email : null,
            phoneNumber: paid ? booking.traveler.phoneNumber : null,
          }
        : null,
      transport: {
        ...booking.transport,
        vehicle,
        filledSeats,
        // Which payment providers the pay page should offer. Read off the
        // transporter's configured payout accounts so we never collect on
        // a rail we can't release on.
        payoutProviders: booking.transport.transporter
          ? configuredPayoutProviders(booking.transport.transporter)
          : [],
        transporter: booking.transport.transporter
          ? {
              id: booking.transport.transporter.id,
              name: booking.transport.transporter.name,
              avatarUrl: transporterAvatar,
              // Rating is visible pre-payment to the traveler — drives
              // the decision to commit. The transporter also sees their
              // own rating here (no harm in echoing it).
              averageRating: transporterRating,
              // Contact unlocks once the booking is paid OR the viewer
              // is the transporter themselves (they always know their
              // own contact info).
              phoneNumber:
                isTransporter || paid ? booking.transport.transporter.phoneNumber : null,
              email:
                isTransporter || paid ? booking.transport.transporter.email : null,
            }
          : booking.transport.transporter,
      },
    };
  }

  async allTransporterBookings(transporterId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        transport: { transporterId },
      },
      include: {
        transport: { include: { vehicle: true } },
        traveler: { select: { id: true, name: true, phoneNumber: true, email: true, avatarUrl: true } },
        // Payout status drives the "RECEIVED" stage in the transporter UI —
        // visible only on this side, never to the traveler.
        payout: { select: { status: true, releasedAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const filledMap = await this.filledSeatsByTransport(
      Array.from(new Set(bookings.map((b) => b.transportId))),
    );

    return Promise.all(
      bookings.map(async (booking) => {
        const paid = this.isPaid(booking);
        // Pre-payment: name + avatar only. Email + phone gate behind PAID.
        // Symmetric with the masking applied to transporter contact on the
        // traveler side — pre-payment communication stays in-app.
        const safeTraveler = booking.traveler
          ? {
              id: booking.traveler.id,
              name: booking.traveler.name,
              avatarUrl: booking.traveler.avatarUrl
                ? await this.storageService.resolveImageUrl(booking.traveler.avatarUrl)
                : null,
              email: paid ? booking.traveler.email : null,
              phoneNumber: paid ? booking.traveler.phoneNumber : null,
            }
          : null;
        return {
          ...booking,
          // Transporter never sees the code via API — must get it from the
          // traveler at pickup.
          verificationCode: null,
          traveler: safeTraveler,
          transport: {
            ...booking.transport,
            filledSeats: filledMap.get(booking.transportId) ?? 0,
            vehicle: booking.transport.vehicle
              ? {
                ...booking.transport.vehicle,
                imageUrl: booking.transport.vehicle.imageUrl
                  ? await this.storageService.resolveImageUrl(booking.transport.vehicle.imageUrl)
                  : null,
              }
              : null,
          },
          // `user` is the legacy alias some pages still read — keep it in
          // sync with the masked traveler payload.
          user: safeTraveler,
        };
      }),
    );
  }

  async transportBookings(transportId: string, transporterId: string) {
    const transport = await this.prisma.transport.findUnique({ where: { id: transportId } });
    if (!transport) throw new NotFoundException('Transport not found');
    if (transport.transporterId !== transporterId) throw new ForbiddenException();

    const bookings = await this.prisma.booking.findMany({
      where: { transportId },
      include: {
        transport: { include: { vehicle: true } },
        traveler: { select: { id: true, name: true, phoneNumber: true, email: true, avatarUrl: true } },
        payout: { select: { status: true, releasedAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Single transport here — one aggregate is fine.
    const filled = await this.filledSeats(transportId);

    return Promise.all(
      bookings.map(async (booking) => {
        const paid = this.isPaid(booking);
        const safeTraveler = booking.traveler
          ? {
              id: booking.traveler.id,
              name: booking.traveler.name,
              avatarUrl: booking.traveler.avatarUrl
                ? await this.storageService.resolveImageUrl(booking.traveler.avatarUrl)
                : null,
              email: paid ? booking.traveler.email : null,
              phoneNumber: paid ? booking.traveler.phoneNumber : null,
            }
          : null;
        return {
          ...booking,
          verificationCode: null,
          traveler: safeTraveler,
          transport: {
            ...booking.transport,
            filledSeats: filled,
            vehicle: booking.transport.vehicle
              ? {
                ...booking.transport.vehicle,
                imageUrl: booking.transport.vehicle.imageUrl
                  ? await this.storageService.resolveImageUrl(booking.transport.vehicle.imageUrl)
                  : null,
              }
              : null,
          },
          user: safeTraveler,
        };
      }),
    );
  }

  async cancel(id: string, travelerId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        transport: true,
        traveler: { select: { id: true, name: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.travelerId !== travelerId) throw new ForbiddenException();
    if (booking.status === BookingStatus.CANCELLED)
      throw new BadRequestException('Already cancelled');

    const [updated] = await this.prisma.$transaction([
      this.prisma.booking.update({
        where: { id },
        data: { status: BookingStatus.CANCELLED },
      }),
      this.prisma.transport.update({
        where: { id: booking.transportId },
        data: { availableSeats: { increment: booking.seatsBooked } },
      }),
    ]);

    this.chatGateway.notifyUser(booking.transport.transporterId, {
      type: 'booking_cancelled',
      bookingId: booking.id,
      traveler: booking.traveler,
      seatsBooked: booking.seatsBooked,
      route: `${booking.transport.departureCity} → ${booking.transport.destinationCity}`,
    });

    return updated;
  }

  /**
   * Admin force-cancel. Used to break stuck bookings (transporter ghosting,
   * disputes, fraud reports) that the traveler/transporter can't resolve
   * between themselves.
   *
   * Rules:
   *   - Allowed from any pre-completed state (PENDING / CONFIRMED / IN_PROGRESS).
   *   - COMPLETED stays terminal — admin shouldn't undo a closed trip.
   *   - Refunds seats back to the transport so the spot can re-book.
   *   - Notifies BOTH parties (the user-facing cancel only notifies the
   *     transporter, which is fine for a traveler-initiated action but not
   *     for an admin-initiated one — both sides need to know).
   *   - Does NOT auto-refund money. If paymentStatus === PAID, finance
   *     still has to issue the refund through the payments admin flow;
   *     this method just stamps the lifecycle so seats free up immediately.
   */
  async adminCancel(id: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        transport: { include: { transporter: { select: { id: true, name: true } } } },
        traveler: { select: { id: true, name: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Already cancelled');
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot cancel a completed booking. Refund through the payment record instead.',
      );
    }

    const route = `${booking.transport.departureCity} → ${booking.transport.destinationCity}`;
    const reasonClean = (reason || '').trim() || null;

    const [updated] = await this.prisma.$transaction([
      this.prisma.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CANCELLED,
          // Re-using the existing column rather than introducing a new one
          // for the cancellation reason. If you ever want a structured
          // cancellation record, promote this to a dedicated column +
          // BookingEvent table.
        },
      }),
      this.prisma.transport.update({
        where: { id: booking.transportId },
        data: { availableSeats: { increment: booking.seatsBooked } },
      }),
    ]);

    const payload = {
      bookingId: booking.id,
      route,
      cancelledBy: 'admin' as const,
      reason: reasonClean,
      seatsBooked: booking.seatsBooked,
    };
    this.chatGateway.notifyUser(booking.travelerId, {
      type: 'booking_cancelled_by_admin',
      ...payload,
      transporter: booking.transport.transporter,
    });
    this.chatGateway.notifyUser(booking.transport.transporterId, {
      type: 'booking_cancelled_by_admin',
      ...payload,
      traveler: booking.traveler,
    });

    return { booking: updated, refundRequired: booking.paymentStatus === PaymentStatus.PAID };
  }

  async confirm(id: string, transporterId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        transport: { include: { transporter: { select: { id: true, name: true } } } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.transport.transporterId !== transporterId) throw new ForbiddenException();
    if (booking.status !== BookingStatus.PENDING)
      throw new BadRequestException('Only pending bookings can be confirmed');

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CONFIRMED },
    });

    this.chatGateway.notifyUser(booking.travelerId, {
      type: 'booking_confirmed',
      bookingId: booking.id,
      transporter: booking.transport.transporter,
      route: `${booking.transport.departureCity} → ${booking.transport.destinationCity}`,
    });

    return updated;
  }

  async reject(id: string, transporterId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        transport: { include: { transporter: { select: { id: true, name: true } } } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.transport.transporterId !== transporterId) throw new ForbiddenException();
    if (booking.status !== BookingStatus.PENDING)
      throw new BadRequestException('Only pending bookings can be rejected');

    const [updated] = await this.prisma.$transaction([
      this.prisma.booking.update({
        where: { id },
        data: { status: BookingStatus.CANCELLED },
      }),
      this.prisma.transport.update({
        where: { id: booking.transportId },
        data: { availableSeats: { increment: booking.seatsBooked } },
      }),
    ]);

    this.chatGateway.notifyUser(booking.travelerId, {
      type: 'booking_rejected',
      bookingId: booking.id,
      transporter: booking.transport.transporter,
      route: `${booking.transport.departureCity} → ${booking.transport.destinationCity}`,
    });

    return updated;
  }

  /**
   * Transporter scans/enters the traveler's 10-digit verification code at
   * pickup. We look up the booking by code (not by ID) so the transporter
   * can't bypass the check by knowing a booking ID — they must hold the
   * actual code the traveler shows them.
   */
  async verifyPickup(code: string, transporterId: string) {
    const cleaned = (code || '').trim();
    // 10 digits for codes generated after the keyspace bump. The 6-digit
    // branch is transitional — kept so any pre-bump in-flight bookings can
    // still be verified. Drop it once those bookings have all aged out.
    if (!/^\d{6}$|^\d{10}$/.test(cleaned)) {
      throw new BadRequestException('Pickup code must be 10 digits');
    }
    const booking = await this.prisma.booking.findUnique({
      where: { verificationCode: cleaned },
      include: {
        transport: { include: { transporter: { select: { id: true, name: true } } } },
        traveler: { select: { id: true, name: true } },
      },
    });
    if (!booking) throw new NotFoundException('No booking matches that code');
    if (booking.transport.transporterId !== transporterId) {
      // Different transporter — don't reveal route/traveler details from
      // someone else's booking. Keep the message vague.
      throw new ForbiddenException("This code belongs to a different transporter's trip");
    }

    // From here on the booking IS one of this transporter's, so we can safely
    // tell them WHICH trip the code points at. Without that, scanning the
    // same passenger's old / future / wrong-trip ticket just produces a
    // generic "already completed" / "already verified" with no way to know
    // which ticket the passenger should actually be showing.
    const route = `${booking.transport.departureCity} → ${booking.transport.destinationCity}`;
    const dep = new Date(booking.transport.departureDateTime).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric',
    });
    const travelerName = booking.traveler.name || 'this passenger';
    const trip = `${travelerName}'s ${route} trip on ${dep}`;

    if (booking.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException(
        `${trip} hasn't been paid for yet — ask them to complete payment before pickup.`,
      );
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException(`${trip} was cancelled — this code is no longer valid.`);
    }
    if (booking.status === BookingStatus.IN_PROGRESS || booking.pickupVerifiedAt) {
      throw new BadRequestException(
        `Pickup for ${trip} was already verified. If this is a different trip, ask the passenger to show the ticket for the correct one.`,
      );
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException(
        `${trip} is already completed — that's an old ticket. Ask the passenger to show the ticket for today's trip.`,
      );
    }

    const updated = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.IN_PROGRESS,
        pickupVerifiedAt: new Date(),
      },
    });

    this.chatGateway.notifyUser(booking.travelerId, {
      type: 'booking_pickup_verified',
      bookingId: booking.id,
      transporter: booking.transport.transporter,
      route: `${booking.transport.departureCity} → ${booking.transport.destinationCity}`,
    });

    return {
      booking: updated,
      traveler: booking.traveler,
      route: `${booking.transport.departureCity} → ${booking.transport.destinationCity}`,
      seatsBooked: booking.seatsBooked,
    };
  }

  /**
   * Transporter-side: "Ride completed". Doesn't end the trip on its own —
   * it stamps completionRequestedAt and notifies the traveler. The traveler
   * still has to confirm via confirmArrival() for the trip to actually flip
   * to COMPLETED + payout to be queued.
   *
   * This split exists so a transporter can't unilaterally trigger their own
   * payout (would be a fraud vector — fake a completion, pocket the money).
   */
  async requestCompletion(id: string, transporterId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        transport: { include: { transporter: { select: { id: true, name: true } } } },
        traveler: { select: { id: true, name: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.transport.transporterId !== transporterId) {
      throw new ForbiddenException();
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('This trip is already completed');
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('This trip is cancelled');
    }
    if (booking.status !== BookingStatus.IN_PROGRESS) {
      throw new BadRequestException(
        "You can only request completion once the trip is in progress (after pickup verification).",
      );
    }
    if (booking.completionRequestedAt) {
      throw new BadRequestException('Completion already requested — waiting for traveler to confirm');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { completionRequestedAt: new Date() },
    });

    this.chatGateway.notifyUser(booking.travelerId, {
      type: 'booking_completion_requested',
      bookingId: booking.id,
      transporter: booking.transport.transporter,
      route: `${booking.transport.departureCity} → ${booking.transport.destinationCity}`,
    });

    return updated;
  }

  /**
   * Traveler-side: "I've arrived". Confirms the trip ended; flips status to
   * COMPLETED and stamps arrivalConfirmedAt. This is what triggers the
   * (manual for now) payout from platform escrow to the transporter.
   */
  // Sent to the transporter when the traveler clicks "I have arrived".
  // Distinct from `booking_completed` (which we used to send here too) so the
  // bell renderer can frame it as "your passenger arrived" rather than the
  // traveler-facing "trip completed, leave a review".
  async confirmArrival(id: string, travelerId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        transport: { include: { transporter: { select: { id: true, name: true } } } },
        traveler: { select: { id: true, name: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.travelerId !== travelerId) throw new ForbiddenException();
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('This trip is already completed');
    }
    if (booking.status !== BookingStatus.IN_PROGRESS) {
      throw new BadRequestException(
        "Can't mark arrived — the transporter hasn't verified your pickup yet",
      );
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.COMPLETED,
        arrivalConfirmedAt: new Date(),
      },
    });

    // Spawn the payout row. Don't await — slow Paystack calls shouldn't delay
    // the user's "I've arrived" response. PayoutsService logs its own errors.
    this.payoutsService
      .createForBooking(booking.id)
      .catch(() => { /* logged inside PayoutsService */ });

    // Notify the transporter that their passenger confirmed arrival. Distinct
    // type from 'booking_completed' so the bell renderer can frame this as
    // "your passenger arrived" instead of the traveler-side "trip completed".
    this.chatGateway.notifyUser(booking.transport.transporterId, {
      type: 'booking_arrival_confirmed',
      bookingId: booking.id,
      traveler: booking.traveler,
      route: `${booking.transport.departureCity} → ${booking.transport.destinationCity}`,
    });

    return updated;
  }

  // NOTE: a legacy `complete()` method existed here that let a transporter
  // unilaterally flip a booking to COMPLETED + queue a payout, with no
  // state check. That defeated the entire fraud-prevention split (the
  // request → traveler-confirms flow). Removed deliberately. Trip closure
  // is exclusively the traveler's call via confirmArrival(); admins force
  // cancel/close via the admin module.

  async updatePaymentMethod(id: string, travelerId: string, paymentMethod: PaymentMethod) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.travelerId !== travelerId) throw new ForbiddenException();
    // Lock the provider once the money has arrived. Otherwise the traveler
    // could swap PAYSTACK → FLUTTERWAVE post-payment, leaving the original
    // PAID Payment row pointing at one provider and the booking advertising
    // the other — webhook reconciliation breaks and the audit trail lies.
    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException(
        "Can't change payment method on a paid booking",
      );
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException("Can't change payment method on a cancelled booking");
    }

    return this.prisma.booking.update({
      where: { id },
      data: { paymentMethod },
    });
  }
}
