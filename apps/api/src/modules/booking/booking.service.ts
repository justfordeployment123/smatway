import {
  BadRequestException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../../common/services/storage.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async create(travelerId: string, dto: CreateBookingDto) {
    const transport = await this.prisma.transport.findUnique({ where: { id: dto.transportId } });
    if (!transport) throw new NotFoundException('Transport not found');
    if (transport.availableSeats < dto.seatsBooked)
      throw new BadRequestException('Not enough seats available');

    const totalPrice = Number(transport.price) * dto.seatsBooked;

    const [booking] = await this.prisma.$transaction([
      this.prisma.booking.create({
        data: {
          travelerId,
          transportId: dto.transportId,
          seatsBooked: dto.seatsBooked,
          totalPrice,
          paymentMethod: dto.paymentMethod,
        },
        include: { transport: true },
      }),
      this.prisma.transport.update({
        where: { id: dto.transportId },
        data: { availableSeats: { decrement: dto.seatsBooked } },
      }),
    ]);

    return booking;
  }

  async myBookings(travelerId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { travelerId },
      include: {
        transport: {
          include: {
            vehicle: true,
            transporter: { select: { id: true, name: true, phoneNumber: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      bookings.map(async (booking: any) => ({
        ...booking,
        transport: {
          ...booking.transport,
          vehicle: booking.transport.vehicle
            ? {
              ...booking.transport.vehicle,
              imageUrl: booking.transport.vehicle.imageUrl
                ? await this.storageService.resolveImageUrl(booking.transport.vehicle.imageUrl)
                : null,
            }
            : null,
        },
      })),
    );
  }

  async findOne(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        transport: {
          include: { transporter: { select: { id: true, name: true, phoneNumber: true } } },
        },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.travelerId !== userId && booking.transport.transporterId !== userId)
      throw new ForbiddenException();
    return booking;
  }

  async allTransporterBookings(transporterId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        transport: { transporterId },
      },
      include: {
        transport: { include: { vehicle: true } },
        traveler: { select: { id: true, name: true, phoneNumber: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      bookings.map(async (booking: any) => ({
        ...booking,
        transport: {
          ...booking.transport,
          vehicle: booking.transport.vehicle
            ? {
              ...booking.transport.vehicle,
              imageUrl: booking.transport.vehicle.imageUrl
                ? await this.storageService.resolveImageUrl(booking.transport.vehicle.imageUrl)
                : null,
            }
            : null,
        },
        user: booking.traveler
          ? {
            ...booking.traveler,
            avatarUrl: booking.traveler.avatarUrl
              ? await this.storageService.resolveImageUrl(booking.traveler.avatarUrl)
              : null,
          }
          : null,
      })),
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
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      bookings.map(async (booking: any) => ({
        ...booking,
        transport: {
          ...booking.transport,
          vehicle: booking.transport.vehicle
            ? {
              ...booking.transport.vehicle,
              imageUrl: booking.transport.vehicle.imageUrl
                ? await this.storageService.resolveImageUrl(booking.transport.vehicle.imageUrl)
                : null,
            }
            : null,
        },
        user: booking.traveler
          ? {
            ...booking.traveler,
            avatarUrl: booking.traveler.avatarUrl
              ? await this.storageService.resolveImageUrl(booking.traveler.avatarUrl)
              : null,
          }
          : null,
      })),
    );
  }

  async cancel(id: string, travelerId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id }, include: { transport: true } });
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

    return updated;
  }

  async confirm(id: string, transporterId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id }, include: { transport: true } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.transport.transporterId !== transporterId) throw new ForbiddenException();
    if (booking.status !== BookingStatus.PENDING)
      throw new BadRequestException('Only pending bookings can be confirmed');

    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CONFIRMED },
    });
  }

  async reject(id: string, transporterId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id }, include: { transport: true } });
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

    return updated;
  }

  async complete(id: string, transporterId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { transport: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.transport.transporterId !== transporterId) throw new ForbiddenException();

    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.COMPLETED },
    });
  }

  async updatePaymentMethod(id: string, travelerId: string, paymentMethod: PaymentMethod) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.travelerId !== travelerId) throw new ForbiddenException();

    return this.prisma.booking.update({
      where: { id },
      data: { paymentMethod },
    });
  }
}
