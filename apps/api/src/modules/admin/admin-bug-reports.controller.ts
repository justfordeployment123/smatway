import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { BugReportsService } from '../bug-reports/bug-reports.service';
import { JwtAdminAuthGuard } from './admin-auth.guard';
import { RequirePermissions } from './admin-permissions.decorator';
import { ADMIN_PERMISSIONS } from './admin.permissions';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminPrincipal } from './admin.types';
import { BugReportKind, BugReportStatus } from '@prisma/client';

class ReplyBugReportDto {
  reply!: string;
}

@Controller('admin/bug-reports')
@UseGuards(JwtAdminAuthGuard)
export class AdminBugReportsController {
  constructor(private readonly bugReports: BugReportsService) {}

  @Get()
  @RequirePermissions(ADMIN_PERMISSIONS.BUG_REPORTS_READ)
  list(
    @Query('kind') kind?: BugReportKind,
    @Query('status') status?: BugReportStatus,
    @Query('cursor') cursor?: string,
    @Query('limit') limitRaw?: string,
  ) {
    return this.bugReports.listAll({
      kind,
      status,
      cursor,
      limit: limitRaw ? parseInt(limitRaw, 10) : undefined,
    });
  }

  @Get('counts')
  @RequirePermissions(ADMIN_PERMISSIONS.BUG_REPORTS_READ)
  counts() {
    return this.bugReports.adminCounts();
  }

  @Get(':id')
  @RequirePermissions(ADMIN_PERMISSIONS.BUG_REPORTS_READ)
  detail(@Param('id') id: string) {
    return this.bugReports.adminFindOne(id);
  }

  @Patch(':id/reply')
  @RequirePermissions(ADMIN_PERMISSIONS.BUG_REPORTS_REPLY)
  reply(
    @CurrentAdmin() admin: AdminPrincipal,
    @Param('id') id: string,
    @Body() dto: ReplyBugReportDto,
  ) {
    // admin.id is null for the env-bootstrap super admin — service handles that.
    return this.bugReports.adminReply(id, admin.id, dto.reply);
  }

  @Patch(':id/close')
  @RequirePermissions(ADMIN_PERMISSIONS.BUG_REPORTS_REPLY)
  close(@Param('id') id: string) {
    return this.bugReports.adminClose(id);
  }
}
