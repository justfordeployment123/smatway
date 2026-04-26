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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../../common/services/storage.service';
import { JwtAdminAuthGuard } from './admin-auth.guard';
import { RequirePermissions } from './admin-permissions.decorator';
import { ADMIN_PERMISSIONS } from './admin.permissions';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminPrincipal } from './admin.types';
import { AdminAuditService } from './admin-audit.service';
import { AnnouncementAudience } from '@prisma/client';
import { AnnouncementGateway } from './announcement.gateway';

const MAX_IMAGES = 4;
const DEFAULT_EXPIRES_IN_DAYS = 7;
const MAX_EXPIRES_IN_DAYS = 365;

class CreateAnnouncementDto {
  title!: string;
  body!: string;
  audience?: AnnouncementAudience;
  isPublished?: boolean;
  /** Days from now until this announcement auto-expires. Default 7. */
  expiresInDays?: number | string;
}

class UpdateAnnouncementDto {
  title?: string;
  body?: string;
  audience?: AnnouncementAudience;
  isPublished?: boolean;
  expiresInDays?: number | string;
  /** Pass `null` (literal) or empty string to clear the expiry (= never expires). */
  clearExpiry?: boolean;
}

@Controller('admin/announcements')
@UseGuards(JwtAdminAuthGuard)
export class AdminAnnouncementsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
    private readonly gateway: AnnouncementGateway,
    private readonly storage: StorageService,
  ) {}

  /** Resolve every imageKey on a row into a fresh presigned URL. */
  private async withImageUrls<T extends { imageKeys: string[] }>(row: T) {
    const imageUrls = await Promise.all(
      row.imageKeys.map((k) => this.storage.resolveImageUrl(k)),
    );
    return { ...row, imageUrls };
  }

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
    const announcements = await Promise.all(items.map((i) => this.withImageUrls(i)));
    return { announcements };
  }

  /**
   * Create an announcement. Accepts multipart/form-data so up to 4 image
   * attachments can be uploaded alongside the text fields. `expiresInDays`
   * defaults to 7 — the public list filters by `expiresAt > now` and
   * lazily deletes anything past it, so this is what makes "auto-remove
   * after a week" work.
   */
  @Post()
  @RequirePermissions(ADMIN_PERMISSIONS.ANNOUNCEMENTS_CREATE)
  @UseInterceptors(FilesInterceptor('images', MAX_IMAGES))
  async create(
    @Body() dto: CreateAnnouncementDto,
    @UploadedFiles() images: Array<{ buffer: Buffer; originalname: string; mimetype: string }> = [],
    @CurrentAdmin() principal: AdminPrincipal,
    @Req() req: Request,
  ) {
    const title = (dto.title || '').trim();
    const body = (dto.body || '').trim();
    if (title.length < 3) throw new BadRequestException('Title must be at least 3 characters');
    if (body.length < 5) throw new BadRequestException('Body must be at least 5 characters');

    const expiresInDays = parseExpiresInDays(dto.expiresInDays);
    const expiresAt =
      expiresInDays === null
        ? null
        : new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    // Upload images first so a failed S3 call doesn't leave a half-attached
    // announcement behind. multer gives us an empty array when no files are
    // attached so the .length check covers that path too.
    const imageKeys: string[] = [];
    for (const file of images ?? []) {
      if (!file.mimetype?.startsWith('image/')) {
        throw new BadRequestException('Attachments must be images');
      }
      const { filePath } = await this.storage.uploadFile(file, 'announcements');
      imageKeys.push(filePath);
    }

    const created = await this.prisma.announcement.create({
      data: {
        title,
        body,
        audience: dto.audience ?? AnnouncementAudience.ALL,
        isPublished: parseBool(dto.isPublished, true),
        imageKeys,
        expiresAt,
        createdByAdminId: principal.id,
      },
    });
    await this.audit.write({
      principal,
      action: 'announcement.create',
      targetType: 'Announcement',
      targetId: created.id,
      metadata: { title, audience: created.audience, imageCount: imageKeys.length, expiresAt },
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    this.gateway.emitCreated(created);
    return { announcement: await this.withImageUrls(created) };
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
    // Expiry: clearExpiry wins if set, otherwise interpret expiresInDays as
    // a fresh "expire N days from now" reset. Updates intentionally re-anchor
    // to "now" rather than to the original createdAt so an admin extending
    // an old announcement gets the full new window.
    if (dto.clearExpiry === true) {
      (data as any).expiresAt = null;
    } else if (dto.expiresInDays !== undefined) {
      const days = parseExpiresInDays(dto.expiresInDays);
      (data as any).expiresAt =
        days === null ? null : new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
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
    return { announcement: await this.withImageUrls(updated) };
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
 *
 * Also opportunistically deletes any expired announcements before returning,
 * which is what makes "auto-remove after N days" actually delete the rows
 * (not just hide them) without us needing a cron / scheduler.
 */
@Controller('announcements')
export class PublicAnnouncementsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  async listForAudience(@Query('audience') audience?: 'TRAVELER' | 'TRANSPORTER') {
    // Lazy cleanup: delete anything past its expiresAt. Cheap because the
    // index makes the filter a partial scan. `deleteMany` is non-blocking
    // for the read below — we just await it for simplicity.
    await this.prisma.announcement.deleteMany({
      where: { expiresAt: { not: null, lte: new Date() } },
    });

    const audienceFilter =
      audience === 'TRAVELER'
        ? { in: [AnnouncementAudience.ALL, AnnouncementAudience.TRAVELERS_ONLY] }
        : audience === 'TRANSPORTER'
          ? { in: [AnnouncementAudience.ALL, AnnouncementAudience.TRANSPORTERS_ONLY] }
          : undefined;

    const where = {
      isPublished: true,
      ...(audienceFilter ? { audience: audienceFilter } : {}),
      // Belt-and-suspenders: even if the cleanup above misses something
      // (race with a concurrent insert at the boundary), don't surface it.
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    };
    const items = await this.prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        body: true,
        audience: true,
        imageKeys: true,
        expiresAt: true,
        createdAt: true,
      },
    });
    const announcements = await Promise.all(
      items.map(async (i) => ({
        ...i,
        imageUrls: await Promise.all(i.imageKeys.map((k) => this.storage.resolveImageUrl(k))),
      })),
    );
    return { announcements };
  }
}

/**
 * Parse the form/body field for "expire in N days". Accepts a number or a
 * numeric string (FormData turns numbers into strings on the wire). Empty /
 * "0" / negative → "never expires" (returns null). Capped at the platform
 * max so an admin doesn't accidentally pin something for years.
 */
function parseExpiresInDays(value: number | string | undefined | null): number | null {
  if (value === undefined || value === null || value === '') return DEFAULT_EXPIRES_IN_DAYS;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return DEFAULT_EXPIRES_IN_DAYS;
  if (n <= 0) return null;
  return Math.min(Math.floor(n), MAX_EXPIRES_IN_DAYS);
}

/** FormData boolean parser — "true"/"false"/true/false/undefined → boolean. */
function parseBool(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === '1';
}
