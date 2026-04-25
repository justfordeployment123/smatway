import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { DatabaseModule } from '../database/database.module';
import { StorageModule } from '../../common/services/storage.module';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
