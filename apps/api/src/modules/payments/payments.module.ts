import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaystackService } from './paystack.service';
import { FlutterwaveService } from './flutterwave.service';
import { DatabaseModule } from '../database/database.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  // ChatModule for ChatGateway — used to push real-time notifications to
  // the transporter when a traveler completes payment.
  imports: [DatabaseModule, ChatModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaystackService, FlutterwaveService],
  // Provider HTTP wrappers are exported so PayoutsModule (and any other
  // downstream module) can inject them without duplicating the singleton.
  exports: [PaymentsService, PaystackService, FlutterwaveService],
})
export class PaymentsModule {}
