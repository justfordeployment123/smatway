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
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../../common/services/storage.service';
import { JwtAdminAuthGuard } from './admin-auth.guard';
import { RequirePermissions } from './admin-permissions.decorator';
import { ADMIN_PERMISSIONS } from './admin.permissions';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminPrincipal } from './admin.types';
import { AdminAuditService } from './admin-audit.service';

class UpdateUserDto {
  name?: string;
  country?: string;
  /** Boolean flag — if false, treat as suspended. Adds an "isActive" field via the user.update path. */
  isActive?: boolean;
}

@Controller('admin/users')
@UseGuards(JwtAdminAuthGuard)
export class AdminUsersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  @RequirePermissions(ADMIN_PERMISSIONS.USERS_READ)
  async list(
    @Query('search') search?: string,
    @Query('accountType') accountType?: 'TRAVELER' | 'TRANSPORTER',
    @Query('limit') limitRaw: string = '50',
    @Query('cursor') cursor?: string,
  ) {
    const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 50, 1), 200);
    const where = {
      ...(accountType ? { accountType } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { phoneNumber: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const items = await this.prisma.user.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        country: true,
        accountType: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: { bookings: true, transports: true, reviewsGiven: true },
        },
      },
    });
    const hasMore = items.length > limit;
    const rows = hasMore ? items.slice(0, limit) : items;
    return {
      users: rows,
      nextCursor: hasMore ? rows[rows.length - 1]?.id ?? null : null,
    };
  }

  @Get(':id')
  @RequirePermissions(ADMIN_PERMISSIONS.USERS_READ)
  async detail(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        _count: {
          select: {
            bookings: true,
            transports: true,
            reviewsGiven: true,
            reviewsReceived: true,
            vehicles: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException();

    // Pull related collections in parallel — vehicles & routes apply to
    // transporters, bookings to travelers, but we fetch all to keep the
    // shape stable regardless of accountType.
    const [vehiclesRaw, transports, bookings, avatarUrl, profileImageUrl] =
      await Promise.all([
        this.prisma.vehicle.findMany({
          where: { transporterId: id, deleted: false },
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: {
            id: true,
            name: true,
            model: true,
            plateNumber: true,
            transportType: true,
            imageUrl: true,
            createdAt: true,
            _count: { select: { transports: true } },
          },
        }),
        this.prisma.transport.findMany({
          where: { transporterId: id },
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            departureCity: true,
            departureCountry: true,
            destinationCity: true,
            destinationCountry: true,
            status: true,
            price: true,
            currency: true,
            availableSeats: true,
            departureDateTime: true,
            createdAt: true,
            vehicle: { select: { id: true, name: true, plateNumber: true } },
            _count: { select: { bookings: true } },
          },
        }),
        this.prisma.booking.findMany({
          where: { travelerId: id },
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            totalPrice: true,
            seatsBooked: true,
            createdAt: true,
            transport: {
              select: {
                id: true,
                departureCity: true,
                destinationCity: true,
                currency: true,
                transporter: { select: { id: true, name: true, email: true } },
              },
            },
          },
        }),
        user.avatarUrl
          ? this.storage.resolveImageUrl(user.avatarUrl).catch(() => null)
          : Promise.resolve(null),
        user.profileImageUrl
          ? this.storage.resolveImageUrl(user.profileImageUrl).catch(() => null)
          : Promise.resolve(null),
      ]);

    // Presign vehicle images — same raw-S3-key story as user avatars.
    const vehicles = await Promise.all(
      vehiclesRaw.map(async (v) => ({
        ...v,
        imageUrl: v.imageUrl
          ? await this.storage.resolveImageUrl(v.imageUrl).catch(() => null)
          : null,
      })),
    );

    return {
      user: {
        ...user,
        avatarUrl,
        profileImageUrl,
        vehicles,
        transports,
        bookings,
      },
    };
  }

  @Patch(':id')
  @RequirePermissions(ADMIN_PERMISSIONS.USERS_EDIT)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentAdmin() principal: AdminPrincipal,
    @Req() req: Request,
  ) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    const data: { name?: string; country?: string } = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.country !== undefined) data.country = dto.country;
    const updated = await this.prisma.user.update({ where: { id }, data });
    await this.audit.write({
      principal,
      action: 'user.update',
      targetType: 'User',
      targetId: id,
      metadata: { changes: dto },
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { user: updated };
  }
}
