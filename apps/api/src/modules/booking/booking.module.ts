import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { DatabaseModule } from '../database/database.module';
import { StorageModule } from '../../common/services/storage.module';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
