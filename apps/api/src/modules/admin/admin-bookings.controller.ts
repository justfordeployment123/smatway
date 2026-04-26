import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PrismaService } from '../database/prisma.service';
import { JwtAdminAuthGuard } from './admin-auth.guard';
import { RequirePermissions } from './admin-permissions.decorator';
import { ADMIN_PERMISSIONS } from './admin.permissions';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminPrincipal } from './admin.types';
import { AdminAuditService } from './admin-audit.service';
import { BookingService } from '../booking/booking.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';

class AdminCancelBookingDto {
  @IsOptional() @IsString() @MaxLength(500)
  reason?: string;
}

@Controller('admin/bookings')
@UseGuards(JwtAdminAuthGuard)
export class AdminBookingsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookings: BookingService,
    private readonly audit: AdminAuditService,
  ) {}

  /** Build a Prisma `createdAt` filter from optional ISO date params. */
  private dateRangeWhere(from?: string, to?: string) {
    if (!from && !to) return {};
    return {
      createdAt: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    };
  }

  @Get()
  @RequirePermissions(ADMIN_PERMISSIONS.BOOKINGS_READ)
  async list(
    @Query('status') status?: BookingStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limitRaw: string = '50',
    @Query('cursor') cursor?: string,
  ) {
    const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 50, 1), 200);
    const items = await this.prisma.booking.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
        ...this.dateRangeWhere(from, to),
      },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        traveler: { select: { id: true, name: true, email: true } },
        transport: {
          select: {
            id: true,
            departureCity: true,
            destinationCity: true,
            currency: true,
            transporter: { select: { id: true, name: true } },
          },
        },
        // Payout drives the derived "RECEIVED" stage on the admin row pill —
        // null means we haven't released funds to the transporter yet.
        payout: { select: { status: true, releasedAt: true } },
      },
    });
    const hasMore = items.length > limit;
    const rows = hasMore ? items.slice(0, limit) : items;
    return {
      bookings: rows,
      nextCursor: hasMore ? rows[rows.length - 1]?.id ?? null : null,
    };
  }

  /**
   * Count bookings grouped by status and by paymentStatus, for the TabFilter
   * count badges. Each grouping respects the *other* filter — so when the
   * user has selected paymentStatus=PAID, the status counts reflect only paid
   * bookings (i.e. "if I switch the status tab, this is what I'll see"). The
   * date range filter applies to both groupings.
   */
  @Get('stats')
  @RequirePermissions(ADMIN_PERMISSIONS.BOOKINGS_READ)
  async stats(
    @Query('status') status?: BookingStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const dateWhere = this.dateRangeWhere(from, to);

    const [byStatusRaw, byPaymentRaw] = await Promise.all([
      this.prisma.booking.groupBy({
        by: ['status'],
        where: { ...dateWhere, ...(paymentStatus ? { paymentStatus } : {}) },
        _count: { _all: true },
      }),
      this.prisma.booking.groupBy({
        by: ['paymentStatus'],
        where: { ...dateWhere, ...(status ? { status } : {}) },
        _count: { _all: true },
      }),
    ]);

    const byStatus: Record<BookingStatus, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    byStatusRaw.forEach((g) => { byStatus[g.status] = g._count._all; });

    const byPayment: Record<PaymentStatus, number> = {
      PENDING: 0,
      PAID: 0,
      FAILED: 0,
    };
    byPaymentRaw.forEach((g) => { byPayment[g.paymentStatus] = g._count._all; });

    return { byStatus, byPayment };
  }

  /**
   * Force-cancel a booking. Used when the traveler/transporter can't resolve
   * a stuck booking (no-shows, fraud reports, double-bookings). Refunds the
   * seats to the transport, notifies both parties, and surfaces a flag if
   * the booking was already paid so finance knows a money refund still owes.
   */
  @Patch(':id/cancel')
  @RequirePermissions(ADMIN_PERMISSIONS.BOOKINGS_EDIT)
  async cancel(
    @Param('id') id: string,
    @Body() dto: AdminCancelBookingDto,
    @CurrentAdmin() principal: AdminPrincipal,
    @Req() req: Request,
  ) {
    const result = await this.bookings.adminCancel(id, dto.reason);
    await this.audit.write({
      principal,
      action: 'booking.cancel',
      targetType: 'Booking',
      targetId: id,
      metadata: {
        reason: dto.reason ?? null,
        refundRequired: result.refundRequired,
      },
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return result;
  }

  @Get(':id')
  @RequirePermissions(ADMIN_PERMISSIONS.BOOKINGS_READ)
  async detail(@Param('id') id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        traveler: { select: { id: true, name: true, email: true, country: true } },
        transport: {
          include: {
            transporter: { select: { id: true, name: true, email: true } },
            vehicle: true,
          },
        },
        review: true,
      },
    });
    if (!booking) throw new NotFoundException();
    return { booking };
  }
}
