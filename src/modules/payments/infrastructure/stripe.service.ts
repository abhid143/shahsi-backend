import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe.Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-03-25.dahlia',
    });
  }

  async createPaymentIntent(amount: number) {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // ₹ → paise
      currency: 'inr',
      automatic_payment_methods: { enabled: true },
    });
  }

  constructEvent(payload: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  }
}