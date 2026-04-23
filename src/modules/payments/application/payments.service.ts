import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';
import { StripeService } from '../infrastructure/stripe.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private stripe: StripeService,
  ) {}

  async createPayment(userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { userId, status: 'PENDING' },
    });

    if (!order) {
      throw new Error('No pending order found');
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
}