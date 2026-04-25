import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../../common/services/storage.service';
import { JwtAdminAuthGuard } from './admin-auth.guard';
import { RequirePermissions } from './admin-permissions.decorator';
import { ADMIN_PERMISSIONS } from './admin.permissions';
import { TransportType } from '@prisma/client';

@Controller('admin/vehicles')
@UseGuards(JwtAdminAuthGuard)
export class AdminVehiclesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  @RequirePermissions(ADMIN_PERMISSIONS.VEHICLES_READ)
  async list(
    @Query('search') search?: string,
    @Query('transportType') transportType?: TransportType,
    @Query('limit') limitRaw: string = '50',
    @Query('cursor') cursor?: string,
  ) {
    const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 50, 1), 200);
    const where = {
      deleted: false,
      ...(transportType ? { transportType } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { model: { contains: search, mode: 'insensitive' as const } },
              { plateNumber: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const items = await this.prisma.vehicle.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        transporter: { select: { id: true, name: true, email: true } },
        _count: { select: { transports: true } },
      },
    });
    const hasMore = items.length > limit;
    const rows = hasMore ? items.slice(0, limit) : items;

    // Resolve presigned image URLs in parallel.
    const resolved = await Promise.all(
      rows.map(async (v) => ({
        ...v,
        imageUrl: v.imageUrl
          ? await this.storage.resolveImageUrl(v.imageUrl).catch(() => null)
          : null,
      })),
    );

    return {
      vehicles: resolved,
      nextCursor: hasMore ? rows[rows.length - 1]?.id ?? null : null,
    };
  }

  @Get(':id')
  @RequirePermissions(ADMIN_PERMISSIONS.VEHICLES_READ)
  async detail(@Param('id') id: string) {
    const v = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        transporter: {
          select: { id: true, name: true, email: true, country: true, phoneNumber: true },
        },
        transports: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            departureCity: true,
            destinationCity: true,
            status: true,
            price: true,
            currency: true,
            availableSeats: true,
            departureDateTime: true,
          },
        },
        _count: { select: { transports: true } },
      },
    });
    if (!v) throw new NotFoundException();
    const imageUrl = v.imageUrl
      ? await this.storage.resolveImageUrl(v.imageUrl).catch(() => null)
      : null;
    return { vehicle: { ...v, imageUrl } };
  }
}
