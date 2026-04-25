import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JwtAdminAuthGuard } from './admin-auth.guard';
import { RequirePermissions } from './admin-permissions.decorator';
import { ADMIN_PERMISSIONS } from './admin.permissions';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Controller('admin/finance')
@UseGuards(JwtAdminAuthGuard)
export class AdminFinanceController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('summary')
  @RequirePermissions(ADMIN_PERMISSIONS.FINANCE_READ)
  async summary() {
    // Group total bookings + revenue by currency, since the platform supports
    // multiple currencies via Transport.currency.
    const paidBookings = await this.prisma.booking.findMany({
      where: { paymentStatus: PaymentStatus.PAID },
      select: {
        totalPrice: true,
        status: true,
        transport: { select: { currency: true } },
      },
    });

    const byCurrency = new Map<
      string,
      { paidGross: number; bookings: number; completedGross: number; completedBookings: number }
    >();
    for (const b of paidBookings) {
      const cur = b.transport.currency || 'USD';
      const slot = byCurrency.get(cur) ?? {
        paidGross: 0,
        bookings: 0,
        completedGross: 0,
        completedBookings: 0,
      };
      const amount = Number(b.totalPrice);
      slot.paidGross += amount;
      slot.bookings += 1;
      if (b.status === BookingStatus.COMPLETED) {
        slot.completedGross += amount;
        slot.completedBookings += 1;
      }
      byCurrency.set(cur, slot);
    }

    const [pendingCount, failedCount, totalBookings] = await Promise.all([
      this.prisma.booking.count({ where: { paymentStatus: PaymentStatus.PENDING } }),
      this.prisma.booking.count({ where: { paymentStatus: PaymentStatus.FAILED } }),
      this.prisma.booking.count(),
    ]);

    return {
      currencies: Array.from(byCurrency.entries()).map(([currency, v]) => ({
        currency,
        paidGross: Math.round(v.paidGross * 100) / 100,
        paidBookings: v.bookings,
        completedGross: Math.round(v.completedGross * 100) / 100,
        completedBookings: v.completedBookings,
      })),
      pendingPayments: pendingCount,
      failedPayments: failedCount,
      totalBookings,
    };
  }

  @Get('top-transporters')
  @RequirePermissions(ADMIN_PERMISSIONS.FINANCE_READ)
  async topTransporters(@Query('limit') limitRaw: string = '10') {
    const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 10, 1), 50);
    const rows = await this.prisma.booking.findMany({
      where: { paymentStatus: PaymentStatus.PAID },
      select: {
        totalPrice: true,
        transport: {
          select: {
            currency: true,
            transporter: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
    const map = new Map<
      string,
      {
        transporterId: string;
        name: string | null;
        email: string;
        bookings: number;
        byCurrency: Record<string, number>;
      }
    >();
    for (const r of rows) {
      const t = r.transport.transporter;
      if (!t) continue;
      const slot = map.get(t.id) ?? {
        transporterId: t.id,
        name: t.name,
        email: t.email,
        bookings: 0,
        byCurrency: {},
      };
      slot.bookings += 1;
      const cur = r.transport.currency || 'USD';
      slot.byCurrency[cur] = (slot.byCurrency[cur] ?? 0) + Number(r.totalPrice);
      map.set(t.id, slot);
    }
    return {
      transporters: Array.from(map.values())
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, limit),
    };
  }
}
