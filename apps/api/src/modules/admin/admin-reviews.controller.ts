import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
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

@Controller('admin/reviews')
@UseGuards(JwtAdminAuthGuard)
export class AdminReviewsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
  ) {}

  @Get()
  @RequirePermissions(ADMIN_PERMISSIONS.REVIEWS_READ)
  async list(
    @Query('limit') limitRaw: string = '50',
    @Query('cursor') cursor?: string,
  ) {
    const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 50, 1), 200);
    const items = await this.prisma.review.findMany({
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        traveler: { select: { id: true, name: true, email: true, country: true } },
        transporter: { select: { id: true, name: true, email: true } },
        booking: { select: { id: true } },
      },
    });
    const hasMore = items.length > limit;
    const rows = hasMore ? items.slice(0, limit) : items;
    return {
      reviews: rows,
      nextCursor: hasMore ? rows[rows.length - 1]?.id ?? null : null,
    };
  }

  @Delete(':id')
  @RequirePermissions(ADMIN_PERMISSIONS.REVIEWS_DELETE)
  async remove(
    @Param('id') id: string,
    @CurrentAdmin() principal: AdminPrincipal,
    @Req() req: Request,
  ) {
    const existing = await this.prisma.review.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    await this.prisma.review.delete({ where: { id } });
    await this.audit.write({
      principal,
      action: 'review.delete',
      targetType: 'Review',
      targetId: id,
      metadata: { rating: existing.rating },
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { ok: true };
  }
}
