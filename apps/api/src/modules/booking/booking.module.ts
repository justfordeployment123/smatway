import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { DatabaseModule } from '../database/database.module';
import { StorageModule } from '../../common/services/storage.module';
import { ChatModule } from '../chat/chat.module';
import { PayoutsModule } from '../payouts/payouts.module';

@Module({
  // PayoutsModule is imported so confirmArrival can call PayoutsService to
  // create a Payout row when the trip closes out.
  imports: [DatabaseModule, StorageModule, ChatModule, PayoutsModule],
  controllers: [BookingController],
  providers: [BookingService],
  // Exported so the admin module can reuse adminCancel() — keeps the
  // notify + seat-refund logic in one place instead of duplicating it.
  exports: [BookingService],
})
export class BookingModule {}
