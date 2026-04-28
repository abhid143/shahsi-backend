import { Module } from '@nestjs/common';
import { PaymentsService } from './application/payments.service';
import { StripeService } from './infrastructure/stripe.service';
import { PaymentsController } from './payments.controller';
import { WebhookController } from './interfaces/webhook.controller';
import { DatabaseModule } from '../../infra/database/database.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [DatabaseModule, OrdersModule],
  controllers: [PaymentsController, WebhookController],
  providers: [PaymentsService, StripeService],
  exports: [PaymentsService], // ✅ correct
})
export class PaymentsModule {}