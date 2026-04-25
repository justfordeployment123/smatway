import { Controller, Get, UseGuards } from '@nestjs/common';
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
        traveler: { select: { name: true } },
        transport: {
          select: {
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
}
