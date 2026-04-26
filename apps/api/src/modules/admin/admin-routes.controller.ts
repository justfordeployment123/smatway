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
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limitRaw: string = '50',
    @Query('cursor') cursor?: string,
  ) {
    const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 50, 1), 200);
    // `from`/`to` filter `departureDateTime` — for routes, the meaningful
    // date is when the trip happens, not when the row was created. Bookings
    // filter by createdAt because that's "when the booking was made"; for
    // routes, "today/this week" naturally means "departing today/this week".
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    const where = {
      ...(status ? { status } : {}),
      ...(fromDate || toDate
        ? {
            departureDateTime: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lt: toDate } : {}),
            },
          }
        : {}),
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

  /**
   * Admin force-block. Excludes the route from traveler search and
   * rejects new bookings; existing bookings continue normally so the
   * passengers already booked aren't stranded. Distinct from deactivate
   * (which is the transporter's "soft-delete" channel) — the audit log
   * captures intent + optional reason.
   */
  @Patch(':id/block')
  @RequirePermissions(ADMIN_PERMISSIONS.ROUTES_EDIT)
  async block(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @CurrentAdmin() principal: AdminPrincipal,
    @Req() req: Request,
  ) {
    const existing = await this.prisma.transport.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    const updated = await this.prisma.transport.update({
      where: { id },
      data: { status: TransportStatus.BLOCKED },
    });
    await this.audit.write({
      principal,
      action: 'route.block',
      targetType: 'Transport',
      targetId: id,
      metadata: {
        previousStatus: existing.status,
        reason: body?.reason?.trim() || null,
      },
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { route: updated };
  }

  /** Lift an admin block — flips the route back to ACTIVE. */
  @Patch(':id/unblock')
  @RequirePermissions(ADMIN_PERMISSIONS.ROUTES_EDIT)
  async unblock(
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
      action: 'route.unblock',
      targetType: 'Transport',
      targetId: id,
      metadata: { previousStatus: existing.status },
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { route: updated };
  }
}
