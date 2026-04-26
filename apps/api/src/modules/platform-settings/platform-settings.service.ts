import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

/**
 * Singleton platform settings reader/writer. The PlatformSettings table is
 * seeded with id=1 by migration 0008, so callers can rely on the row
 * existing — `findFirst` (not `findUnique` against a fake id) keeps things
 * simple and tolerant if the seed is ever blown away.
 *
 * Used by:
 *   - PayoutsService.commissionRate() / autoPayoutEnabled() at trip-complete time
 *   - AdminSettingsController for the admin UI
 */
@Injectable()
export class PlatformSettingsService {
  private readonly logger = new Logger(PlatformSettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Read the current settings. Falls back to env defaults if row missing. */
  async get() {
    const row = await this.prisma.platformSettings.findFirst({
      orderBy: { id: 'asc' },
    });
    if (row) {
      return {
        commissionRate: Number(row.commissionRate),
        autoPayoutEnabled: row.autoPayoutEnabled,
        updatedAt: row.updatedAt,
        updatedByAdminId: row.updatedByAdminId,
      };
    }
    // First-boot fallback. Read from env so existing deployments don't
    // suddenly drop to 0% commission if migration ordering is off.
    return {
      commissionRate: parseFloat(process.env.PLATFORM_COMMISSION_RATE ?? '0.1') || 0.1,
      autoPayoutEnabled: process.env.PAYSTACK_AUTO_PAYOUT === 'true',
      updatedAt: null,
      updatedByAdminId: null,
    };
  }

  /**
   * Update settings. Validates commissionRate is sane (0–0.5 = 0–50%).
   * Returns the previous + new values so the caller (controller) can audit
   * what changed and trigger downstream effects (e.g. announcement to
   * transporters when commission moves).
   */
  async update(input: {
    commissionRate?: number;
    autoPayoutEnabled?: boolean;
    adminId?: string | null;
  }) {
    if (
      input.commissionRate != null &&
      (!Number.isFinite(input.commissionRate) ||
        input.commissionRate < 0 ||
        input.commissionRate > 0.5)
    ) {
      throw new BadRequestException(
        'commissionRate must be a number between 0 and 0.5 (0% to 50%)',
      );
    }

    const prev = await this.get();

    const row = await this.prisma.platformSettings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        commissionRate: input.commissionRate ?? prev.commissionRate,
        autoPayoutEnabled: input.autoPayoutEnabled ?? prev.autoPayoutEnabled,
        updatedByAdminId: input.adminId ?? null,
      },
      update: {
        ...(input.commissionRate != null
          ? { commissionRate: input.commissionRate }
          : {}),
        ...(input.autoPayoutEnabled != null
          ? { autoPayoutEnabled: input.autoPayoutEnabled }
          : {}),
        updatedByAdminId: input.adminId ?? null,
      },
    });

    return {
      prev,
      next: {
        commissionRate: Number(row.commissionRate),
        autoPayoutEnabled: row.autoPayoutEnabled,
        updatedAt: row.updatedAt,
        updatedByAdminId: row.updatedByAdminId,
      },
    };
  }
}
