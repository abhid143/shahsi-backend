import {
  Controller,
  Post,
  Req,
  Headers,
  Inject,
  forwardRef,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from '../infrastructure/stripe.service';
import { PaymentsService } from '../application/payments.service';
import { BridalPartyService } from '../../bridal-party/bridal-party.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private stripe: StripeService,
    private payments: PaymentsService,

    @Inject(forwardRef(() => BridalPartyService)) // ✅ FIXED
    private bridalPartyService: BridalPartyService,
  ) {}

  @Post('stripe')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    const event = this.stripe.constructEvent(
      req.rawBody || Buffer.alloc(0),
      sig,
    );

    // ✅ PAYMENT SUCCESS
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any;

      const memberId = paymentIntent.metadata?.memberId;
      const selectionId = paymentIntent.metadata?.selectionId;

      // 🔥 FIX: PASS BOTH VALUES
      if (memberId && selectionId) {
        await this.bridalPartyService.handlePaymentSuccess(
          memberId,
          selectionId,
        );
      }

      // existing order flow
      await this.payments.handleSuccess(paymentIntent.id);
    }

    // ❌ PAYMENT FAILED
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as any;

      await this.payments.handleFailure(paymentIntent.id);
    }

    return { received: true };
  }
}