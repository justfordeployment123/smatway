import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AdminPrincipal } from './admin.types';

export interface AuditWriteInput {
  principal: AdminPrincipal;
  action: string; // e.g. "user.suspend"
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AdminAuditService {
  private readonly logger = new Logger(AdminAuditService.name);
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Append-only audit row. We never throw out of this — losing the audit log
   * shouldn't fail the originating request.
   */
  async write(input: AuditWriteInput): Promise<void> {
    try {
      await this.prisma.adminAuditLog.create({
        data: {
          adminId: input.principal.id,
          adminLabel: input.principal.isEnvBootstrap
            ? 'ENV_SUPERADMIN'
            : input.principal.username,
          action: input.action,
          targetType: input.targetType ?? null,
          targetId: input.targetId ?? null,
          metadata: (input.metadata as object | undefined) ?? undefined,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
        },
      });
    } catch (err) {
      this.logger.error('Failed to write audit log', err as Error);
    }
  }

  async list(params: { limit?: number; cursor?: string; from?: string; to?: string } = {}) {
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 200);
    // `from` / `to` are ISO timestamps representing the user's local-day
    // boundary converted to UTC by the client — same convention as
    // /admin/bookings, so the helper can be lifted across pages without
    // re-translating timezones each time.
    const fromDate = params.from ? new Date(params.from) : null;
    const toDate = params.to ? new Date(params.to) : null;
    const items = await this.prisma.adminAuditLog.findMany({
      where:
        fromDate || toDate
          ? {
              createdAt: {
                ...(fromDate ? { gte: fromDate } : {}),
                ...(toDate ? { lt: toDate } : {}),
              },
            }
          : undefined,
      take: limit + 1,
      cursor: params.cursor ? { id: params.cursor } : undefined,
      skip: params.cursor ? 1 : 0,
      orderBy: { createdAt: 'desc' },
    });
    const hasMore = items.length > limit;
    const rows = hasMore ? items.slice(0, limit) : items;
    return {
      logs: rows,
      nextCursor: hasMore ? rows[rows.length - 1]?.id ?? null : null,
    };
  }
}
