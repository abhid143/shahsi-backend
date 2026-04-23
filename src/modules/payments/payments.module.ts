import { Module } from '@nestjs/common';
import { PaymentsService } from './application/payments.service';
import { StripeService } from './infrastructure/stripe.service';
import { PaymentsController } from './payments.controller'
import { WebhookController } from './interfaces/webhook.controller';
import { DatabaseModule } from '../../infra/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PaymentsController, WebhookController],
  providers: [PaymentsService, StripeService],
})
export class PaymentsModule {}