import { Module, forwardRef } from '@nestjs/common';
import { PaymentsService } from './application/payments.service';
import { StripeService } from './infrastructure/stripe.service';
import { PaymentsController } from './payments.controller';
import { WebhookController } from './interfaces/webhook.controller';
import { DatabaseModule } from '../../infra/database/database.module';
import { OrdersModule } from '../orders/orders.module';
import { BridalPartyModule } from '../bridal-party/bridal-party.module';

@Module({
  imports: [
    DatabaseModule,
    OrdersModule,
    forwardRef(() => BridalPartyModule), // ✅ FIX
  ],
  controllers: [PaymentsController, WebhookController],
  providers: [PaymentsService, StripeService],
  exports: [PaymentsService],
})
export class PaymentsModule {}