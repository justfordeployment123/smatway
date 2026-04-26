import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAdminAuthGuard } from './admin-auth.guard';
import { RequirePermissions } from './admin-permissions.decorator';
import { ADMIN_PERMISSIONS } from './admin.permissions';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminPrincipal } from './admin.types';
import { AdminAuditService } from './admin-audit.service';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';
import { PrismaService } from '../database/prisma.service';
import { AnnouncementAudience } from '@prisma/client';

class UpdateSettingsDto {
  commissionRate?: number;
  autoPayoutEnabled?: boolean;
}

@Controller('admin/settings')
@UseGuards(JwtAdminAuthGuard)
export class AdminSettingsController {
  constructor(
    private readonly settings: PlatformSettingsService,
    private readonly audit: AdminAuditService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Anyone with SETTINGS_EDIT can read — there's no separate read perm because
   * the values aren't sensitive (they're shown to every transporter on
   * /dashboard/my-payouts implicitly via the commission breakdown).
   */
  @Get()
  @RequirePermissions(ADMIN_PERMISSIONS.SETTINGS_EDIT)
  get() {
    return this.settings.get();
  }

  /**
   * Save changes. When the commission rate moves, we automatically post an
   * announcement to all transporters so nobody is surprised by a different
   * payout breakdown next trip.
   */
  @Put()
  @RequirePermissions(ADMIN_PERMISSIONS.SETTINGS_EDIT)
  async update(
    @Body() dto: UpdateSettingsDto,
    @CurrentAdmin() principal: AdminPrincipal,
    @Req() req: Request,
  ) {
    const { prev, next } = await this.settings.update({
      commissionRate: dto.commissionRate,
      autoPayoutEnabled: dto.autoPayoutEnabled,
      adminId: principal.id ?? null,
    });

    await this.audit.write({
      principal,
      action: 'settings.update',
      targetType: 'PlatformSettings',
      targetId: '1',
      metadata: { prev, next },
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });

    // Auto-announce commission change to transporters. Only fires on actual
    // numeric change so toggling auto-payout doesn't spam an announcement.
    if (
      dto.commissionRate != null &&
      Math.abs(prev.commissionRate - next.commissionRate) > 1e-6
    ) {
      const oldPct = (prev.commissionRate * 100).toFixed(1);
      const newPct = (next.commissionRate * 100).toFixed(1);
      await this.prisma.announcement.create({
        data: {
          title: `Platform commission updated to ${newPct}%`,
          body:
            `The platform commission rate has changed from ${oldPct}% to ${newPct}%. ` +
            `From your next completed trip onward, this is the percentage SmatWay deducts ` +
            `from each booking before paying you out. Earlier bookings keep their original rate.`,
          audience: AnnouncementAudience.TRANSPORTERS_ONLY,
          isPublished: true,
          createdByAdminId: principal.id ?? null,
        },
      });
    }

    return { settings: next };
  }
}
