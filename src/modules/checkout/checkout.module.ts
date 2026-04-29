import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { DatabaseModule } from '../../infra/database/database.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    DatabaseModule,
    PaymentsModule,
  ],
  providers: [CheckoutService],
  controllers: [CheckoutController],
  exports: [CheckoutService],
})
export class CheckoutModule {}