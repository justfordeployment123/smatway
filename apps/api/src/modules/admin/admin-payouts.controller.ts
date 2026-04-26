import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAdminAuthGuard } from './admin-auth.guard';
import { RequirePermissions } from './admin-permissions.decorator';
import { ADMIN_PERMISSIONS } from './admin.permissions';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminPrincipal } from './admin.types';
import { AdminAuditService } from './admin-audit.service';
import { PayoutsService } from '../payouts/payouts.service';
import { PayoutStatus } from '@prisma/client';

class MarkFailedDto {
  reason!: string;
}

@Controller('admin/payouts')
@UseGuards(JwtAdminAuthGuard)
export class AdminPayoutsController {
  constructor(
    private readonly payouts: PayoutsService,
    private readonly audit: AdminAuditService,
  ) {}

  @Get()
  @RequirePermissions(ADMIN_PERMISSIONS.PAYOUTS_READ)
  list(
    @Query('status') status?: PayoutStatus,
    @Query('limit') limitRaw?: string,
    @Query('cursor') cursor?: string,
  ) {
    const limit = limitRaw ? parseInt(limitRaw, 10) : 50;
    return this.payouts.listAll({ status, limit, cursor });
  }

  /**
   * Manually release a pending payout. Calls Paystack /transfer. On success
   * the row moves to PROCESSING (or RELEASED if Paystack returns success
   * immediately — common in test mode without OTP). On failure → FAILED.
   */
  @Post(':id/release')
  @RequirePermissions(ADMIN_PERMISSIONS.PAYOUTS_RELEASE)
  async release(
    @Param('id') id: string,
    @CurrentAdmin() principal: AdminPrincipal,
    @Req() req: Request,
  ) {
    await this.payouts.adminRelease(id);
    await this.audit.write({
      principal,
      action: 'payout.release',
      targetType: 'Payout',
      targetId: id,
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { ok: true };
  }

  /** Re-verify a PROCESSING payout against Paystack — useful if a webhook was missed. */
  @Post(':id/reconcile')
  @RequirePermissions(ADMIN_PERMISSIONS.PAYOUTS_READ)
  async reconcile(@Param('id') id: string) {
    const status = await this.payouts.reconcile(id);
    return { status };
  }

  /** Force-fail a payout (e.g. when a transporter disputes the trip). */
  @Post(':id/mark-failed')
  @RequirePermissions(ADMIN_PERMISSIONS.PAYOUTS_RELEASE)
  async markFailed(
    @Param('id') id: string,
    @Body() dto: MarkFailedDto,
    @CurrentAdmin() principal: AdminPrincipal,
    @Req() req: Request,
  ) {
    const reason = (dto.reason || '').trim() || 'Marked failed by admin';
    const updated = await this.payouts.adminMarkFailed(id, reason);
    await this.audit.write({
      principal,
      action: 'payout.mark_failed',
      targetType: 'Payout',
      targetId: id,
      metadata: { reason },
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    return { payout: updated };
  }
}
