import { Module } from '@nestjs/common';
import { PayoutsController } from './payouts.controller';
import { PayoutsService } from './payouts.service';
import { DatabaseModule } from '../database/database.module';
import { PaymentsModule } from '../payments/payments.module';
import { ChatModule } from '../chat/chat.module';
import { PlatformSettingsModule } from '../platform-settings/platform-settings.module';

@Module({
  // ChatModule for ChatGateway — used to push real-time notifications to
  // the transporter when a payout is released.
  // PlatformSettingsModule for runtime commission + auto-payout reads.
  imports: [DatabaseModule, PaymentsModule, ChatModule, PlatformSettingsModule],
  controllers: [PayoutsController],
  providers: [PayoutsService],
  exports: [PayoutsService],
})
export class PayoutsModule {}
