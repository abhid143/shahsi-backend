import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';
import { StripeService } from '../infrastructure/stripe.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private stripe: StripeService,
  ) {}

  async createPayment(orderId: string) {
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  const intent = await this.stripe.createPaymentIntent(order.total);

  await this.prisma.order.update({
    where: { id: order.id },
    data: {
      paymentId: intent.id,
    },
  });

  return {
    clientSecret: intent.client_secret,
  };
}

  async handleSuccess(paymentIntentId: string) {
    return this.prisma.order.updateMany({
      where: { paymentId: paymentIntentId },
      data: { status: 'PAID' },
    });
  }

  async handleFailure(paymentIntentId: string) {
    return this.prisma.order.updateMany({
      where: { paymentId: paymentIntentId },
      data: { status: 'FAILED' },
    });
  }
}