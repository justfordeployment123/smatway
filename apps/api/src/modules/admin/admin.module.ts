import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { StorageModule } from '../../common/services/storage.module';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuditService } from './admin-audit.service';
import { JwtAdminAuthGuard } from './admin-auth.guard';
import { AdminAuthController } from './admin-auth.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminRoutesController } from './admin-routes.controller';
import { AdminBookingsController } from './admin-bookings.controller';
import { AdminFinanceController } from './admin-finance.controller';
import { AdminFeedbackController } from './admin-feedback.controller';
import { AdminReviewsController } from './admin-reviews.controller';
import {
  AdminAnnouncementsController,
  PublicAnnouncementsController,
} from './admin-announcements.controller';
import { AdminManagementController } from './admin-management.controller';
import { AdminAuditController } from './admin-audit.controller';
import { AdminOverviewController } from './admin-overview.controller';
import { AdminVehiclesController } from './admin-vehicles.controller';
import { AdminPayoutsController } from './admin-payouts.controller';
import { AdminSettingsController } from './admin-settings.controller';
import { AdminBugReportsController } from './admin-bug-reports.controller';
import { AnnouncementGateway } from './announcement.gateway';
import { PayoutsModule } from '../payouts/payouts.module';
import { PlatformSettingsModule } from '../platform-settings/platform-settings.module';
import { BugReportsModule } from '../bug-reports/bug-reports.module';
// Imported so AdminBookingsController can call BookingService.adminCancel()
// — the seat-refund + dual-party notification logic lives there.
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [
    DatabaseModule,
    StorageModule,
    PayoutsModule,
    PlatformSettingsModule,
    BugReportsModule,
    BookingModule,
    // Default JWT options here are placeholders — admin-auth.service signs/verifies
    // with explicit `secret` and `expiresIn` (from process.env.ADMIN_JWT_*) so the
    // admin JWT is fully isolated from the user JWT secret.
    JwtModule.register({}),
  ],
  controllers: [
    AdminAuthController,
    AdminOverviewController,
    AdminUsersController,
    AdminRoutesController,
    AdminVehiclesController,
    AdminBookingsController,
    AdminFinanceController,
    AdminFeedbackController,
    AdminReviewsController,
    AdminAnnouncementsController,
    PublicAnnouncementsController,
    AdminManagementController,
    AdminAuditController,
    AdminPayoutsController,
    AdminSettingsController,
    AdminBugReportsController,
  ],
  providers: [
    AdminAuthService,
    AdminAuditService,
    JwtAdminAuthGuard,
    AnnouncementGateway,
  ],
  exports: [AdminAuthService, AdminAuditService, JwtAdminAuthGuard],
})
export class AdminModule {}
