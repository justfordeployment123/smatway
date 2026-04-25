import {
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
import { TransportStatus } from '@prisma/client';

@Controller('admin/routes')
@UseGuards(JwtAdminAuthGuard)
export class AdminRoutesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  @RequirePermissions(ADMIN_PERMISSIONS.ROUTES_READ)
  async list(
    @Query('search') search?: string,
    @Query('status') status?: TransportStatus,
    @Query('limit') limitRaw: string = '50',
    @Query('cursor') cursor?: string,
  ) {
    const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 50, 1), 200);
    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { departureCity: { contains: search, mode: 'insensitive' as const } },
              { destinationCity: { contains: search, mode: 'insensitive' as const } },
              { departureCountry: { contains: search, mode: 'insensitive' as const } },
              { destinationCountry: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const items = await this.prisma.transport.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        transporter: { select: { id: true, name: true, email: true } },
        vehicle: { select: { id: true, name: true, plateNumber: true } },
        _count: { select: { bookings: true } },
      },
    });
    const hasMore = items.length > limit;
    const rows = hasMore ? items.slice(0, limit) : items;
    return {
      routes: rows,
      nextCursor: hasMore ? rows[rows.length - 1]?.id ?? null : null,
    };
  }

  @Get(':id')
  @RequirePermissions(ADMIN_PERMISSIONS.ROUTES_READ)
  async detail(@Param('id') id: string) {
    const route = await this.prisma.transport.findUnique({
      where: { id },
      include: {
        transporter: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            country: true,
            avatarUrl: true,
            profileImageUrl: true,
          },
        },
        vehicle: true,
        bookings: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { traveler: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { bookings: true } },
      },
    });
    if (!route) throw new NotFoundException();
    // Presign the vehicle image + the transporter's avatar so the admin UI
    // can render them directly without doing extra round-trips.
    const [vehicleImageUrl, transporterAvatarUrl] = await Promise.all([
      route.vehicle?.imageUrl
        ? this.storage.resolveImageUrl(route.vehicle.imageUrl).catch(() => null)
        : Promise.resolve(null),
      (route.transporter.profileImageUrl || route.transporter.avatarUrl)
        ? this.storage
            .resolveImageUrl(
              (route.transporter.profileImageUrl || route.transporter.avatarUrl) as string,
            )
            .catch(() => null)
        : Promise.resolve(null),
    ]);
    return {
      route: {
        ...route,
        vehicle: route.vehicle ? { ...route.vehicle, imageUrl: vehicleImageUrl } : null,
        transporter: { ...route.transporter, avatarUrl: transporterAvatarUrl },
      },
    };
  }

  @Patch(':id/deactivate')
  @RequirePermissions(ADMIN_PERMISSIONS.ROUTES_EDIT)
  async deactivate(
    @Param('id') id: string,
    @CurrentAdmin() principal: AdminPrincipal,
    @Req() req: Request,
  ) {
    const existing = await this.prisma.transport.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    const updated = await this.prisma.transport.update({
      where: { id },
      data: { status: TransportStatus.INACTIVE },
    });
    await this.audit.write({
      principal,
      action: 'route.deactivate',
      targetType: 'Transport',
      targetId: id,
      metadata: { previousStatus: existing.status },
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { route: updated };
  }

  @Patch(':id/activate')
  @RequirePermissions(ADMIN_PERMISSIONS.ROUTES_EDIT)
  async activate(
    @Param('id') id: string,
    @CurrentAdmin() principal: AdminPrincipal,
    @Req() req: Request,
  ) {
    const existing = await this.prisma.transport.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    const updated = await this.prisma.transport.update({
      where: { id },
      data: { status: TransportStatus.ACTIVE },
    });
    await this.audit.write({
      principal,
      action: 'route.activate',
      targetType: 'Transport',
      targetId: id,
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { route: updated };
  }
}
