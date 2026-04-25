import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAdminAuthGuard } from './admin-auth.guard';
import { RequirePermissions } from './admin-permissions.decorator';
import { ADMIN_PERMISSIONS } from './admin.permissions';
import { AdminAuditService } from './admin-audit.service';

@Controller('admin/audit')
@UseGuards(JwtAdminAuthGuard)
export class AdminAuditController {
  constructor(private readonly audit: AdminAuditService) {}

  @Get()
  @RequirePermissions(ADMIN_PERMISSIONS.AUDIT_READ)
  list(@Query('limit') limitRaw?: string, @Query('cursor') cursor?: string) {
    const limit = limitRaw ? parseInt(limitRaw, 10) : 50;
    return this.audit.list({ limit, cursor });
  }
}
