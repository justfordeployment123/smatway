import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JwtAdminAuthGuard } from './admin-auth.guard';
import { RequirePermissions } from './admin-permissions.decorator';
import { ADMIN_PERMISSIONS } from './admin.permissions';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Controller('admin/bookings')
@UseGuards(JwtAdminAuthGuard)
export class AdminBookingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @RequirePermissions(ADMIN_PERMISSIONS.BOOKINGS_READ)
  async list(
    @Query('status') status?: BookingStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('limit') limitRaw: string = '50',
    @Query('cursor') cursor?: string,
  ) {
    const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 50, 1), 200);
    const items = await this.prisma.booking.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
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
      },
    });
    const hasMore = items.length > limit;
    const rows = hasMore ? items.slice(0, limit) : items;
    return {
      bookings: rows,
      nextCursor: hasMore ? rows[rows.length - 1]?.id ?? null : null,
    };
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
