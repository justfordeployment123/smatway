import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PlatformSettingsService } from './platform-settings.service';

/**
 * Standalone module for platform-wide editable settings (commission rate,
 * auto-payout toggle). Lives outside the AdminModule because both
 * AdminModule (for the controller) and PayoutsModule (for runtime reads)
 * need access — AdminModule already imports PayoutsModule, so putting the
 * service inside AdminModule would create a circular import.
 */
@Module({
  imports: [DatabaseModule],
  providers: [PlatformSettingsService],
  exports: [PlatformSettingsService],
})
export class PlatformSettingsModule {}
