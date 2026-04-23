import { Controller, Post, Req, Headers } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from '../infrastructure/stripe.service';
import { PaymentsService } from '../application/payments.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private stripe: StripeService,
    private payments: PaymentsService,
  ) {}

  @Post('stripe')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    const event = this.stripe.constructEvent(req.rawBody || Buffer.alloc(0), sig);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any;

      await this.payments.handleSuccess(paymentIntent.id);
    }

    return { received: true };
  }
}