import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../database/prisma.service';
import { JwtAdminAuthGuard } from './admin-auth.guard';
import { RequirePermissions } from './admin-permissions.decorator';
import { ADMIN_PERMISSIONS } from './admin.permissions';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminPrincipal } from './admin.types';
import { AdminAuditService } from './admin-audit.service';
import { AnnouncementAudience } from '@prisma/client';
import { AnnouncementGateway } from './announcement.gateway';

class CreateAnnouncementDto {
  title!: string;
  body!: string;
  audience?: AnnouncementAudience;
  isPublished?: boolean;
}

class UpdateAnnouncementDto {
  title?: string;
  body?: string;
  audience?: AnnouncementAudience;
  isPublished?: boolean;
}

@Controller('admin/announcements')
@UseGuards(JwtAdminAuthGuard)
export class AdminAnnouncementsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
    private readonly gateway: AnnouncementGateway,
  ) {}

  @Get()
  @RequirePermissions(ADMIN_PERMISSIONS.ANNOUNCEMENTS_READ)
  async list(
    @Query('audience') audience?: AnnouncementAudience,
    @Query('limit') limitRaw: string = '50',
  ) {
    const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 50, 1), 200);
    const items = await this.prisma.announcement.findMany({
      where: { ...(audience ? { audience } : {}) },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        createdByAdmin: { select: { id: true, username: true, email: true } },
      },
    });
    return { announcements: items };
  }

  @Post()
  @RequirePermissions(ADMIN_PERMISSIONS.ANNOUNCEMENTS_CREATE)
  async create(
    @Body() dto: CreateAnnouncementDto,
    @CurrentAdmin() principal: AdminPrincipal,
    @Req() req: Request,
  ) {
    const title = (dto.title || '').trim();
    const body = (dto.body || '').trim();
    if (title.length < 3) throw new BadRequestException('Title must be at least 3 characters');
    if (body.length < 5) throw new BadRequestException('Body must be at least 5 characters');
    const created = await this.prisma.announcement.create({
      data: {
        title,
        body,
        audience: dto.audience ?? AnnouncementAudience.ALL,
        isPublished: dto.isPublished ?? true,
        createdByAdminId: principal.id,
      },
    });
    await this.audit.write({
      principal,
      action: 'announcement.create',
      targetType: 'Announcement',
      targetId: created.id,
      metadata: { title, audience: created.audience },
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    this.gateway.emitCreated(created);
    return { announcement: created };
  }

  @Patch(':id')
  @RequirePermissions(ADMIN_PERMISSIONS.ANNOUNCEMENTS_CREATE)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
    @CurrentAdmin() principal: AdminPrincipal,
    @Req() req: Request,
  ) {
    const existing = await this.prisma.announcement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    const data: Partial<CreateAnnouncementDto> = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.body !== undefined) data.body = dto.body.trim();
    if (dto.audience !== undefined) data.audience = dto.audience;
    if (dto.isPublished !== undefined) data.isPublished = dto.isPublished;
    const updated = await this.prisma.announcement.update({ where: { id }, data });
    await this.audit.write({
      principal,
      action: 'announcement.update',
      targetType: 'Announcement',
      targetId: id,
      metadata: { changes: dto },
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    // If publishing flipped on, treat as a new arrival for clients; otherwise
    // an updated event so the user dashboard refetches.
    if (dto.isPublished === true && existing.isPublished === false) {
      this.gateway.emitCreated(updated);
    } else if (updated.isPublished) {
      this.gateway.emitUpdated(updated);
    } else {
      // Newly hidden — tell clients to drop it.
      this.gateway.emitDeleted(updated);
    }
    return { announcement: updated };
  }

  @Delete(':id')
  @RequirePermissions(ADMIN_PERMISSIONS.ANNOUNCEMENTS_DELETE)
  async remove(
    @Param('id') id: string,
    @CurrentAdmin() principal: AdminPrincipal,
    @Req() req: Request,
  ) {
    const existing = await this.prisma.announcement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    await this.prisma.announcement.delete({ where: { id } });
    await this.audit.write({
      principal,
      action: 'announcement.delete',
      targetType: 'Announcement',
      targetId: id,
      metadata: { title: existing.title, audience: existing.audience },
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    this.gateway.emitDeleted(existing);
    return { ok: true };
  }
}

/**
 * Public announcement read endpoint for the user-side dashboards. Filters by
 * audience: travelers see ALL + TRAVELERS_ONLY; transporters see ALL + TRANSPORTERS_ONLY.
 * Lives outside the admin guard because it's open to authenticated users.
 */
@Controller('announcements')
export class PublicAnnouncementsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async listForAudience(@Query('audience') audience?: 'TRAVELER' | 'TRANSPORTER') {
    const where = audience === 'TRAVELER'
      ? { isPublished: true, audience: { in: [AnnouncementAudience.ALL, AnnouncementAudience.TRAVELERS_ONLY] } }
      : audience === 'TRANSPORTER'
        ? { isPublished: true, audience: { in: [AnnouncementAudience.ALL, AnnouncementAudience.TRANSPORTERS_ONLY] } }
        : { isPublished: true };
    const items = await this.prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        body: true,
        audience: true,
        createdAt: true,
      },
    });
    return { announcements: items };
  }
}
