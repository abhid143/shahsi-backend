import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';
import { StripeService } from '../infrastructure/stripe.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private stripe: StripeService,
  ) {}

  // ✅ ORDER PAYMENT (existing)
  async createPayment(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // 🔥 FIX: pass metadata
    const intent = await this.stripe.createPaymentIntent(order.total, {
      orderId: order.id,
    });

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
  // 🔥 NEW: BRIDAL PAYMENT (REAL STRIPE)

    // 🔥 FIXED: BRIDAL PAYMENT (VARIANT PRICE)
async createBridalPayment(
  eventId: string,
  memberId: string,
  selectionId: string,
) {
  // 1️⃣ GET SELECTION
  const selection = await this.prisma.bridalPartySelection.findUnique({
    where: { id: selectionId },
  });

  if (!selection) throw new Error('Selection not found');

  if (!selection.variantId) {
    throw new Error('Variant not selected');
  }

  // 2️⃣ GET VARIANT PRICE (NOT PRODUCT)
  const variant = await this.prisma.productVariant.findUnique({
    where: { id: selection.variantId },
  });

  if (!variant) throw new Error('Variant not found');

  const amount = variant.price; // ✅ REAL PRICE FROM VARIANT

  // 3️⃣ CREATE STRIPE INTENT
  const intent = await this.stripe.createPaymentIntent(amount, {
    memberId,
    eventId,
    selectionId,
  });

  // 4️⃣ SAVE PAYMENT
  const payment = await this.prisma.bridalPartyPayment.create({
    data: {
      eventId,
      memberId,
      amount,
      status: 'pending',
      stripePaymentIntentId: intent.id,
    },
  });

  // 5️⃣ RESPONSE
  return {
    paymentId: payment.id,
    amount,
    currency: 'INR',
    clientSecret: intent.client_secret,
    stripePaymentIntentId: intent.id,
  };
}

  // 🔥 MAIN MAGIC (WEBHOOK FLOW)
  async handleSuccess(paymentIntentId: string) {
    // 1️⃣ TRY ORDER FIRST
    const orderUpdated = await this.prisma.order.updateMany({
      where: { paymentId: paymentIntentId },
      data: { status: 'PAID' },
    });

    // 2️⃣ TRY BRIDAL PAYMENT
    const bridalPayment = await this.prisma.bridalPartyPayment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!bridalPayment) return orderUpdated;

    // mark payment paid
    await this.prisma.bridalPartyPayment.update({
      where: { id: bridalPayment.id },
      data: { status: 'paid' },
    });

    // mark member paid
    await this.prisma.bridalPartyMember.update({
      where: { id: bridalPayment.memberId },
      data: { status: 'paid' },
    });

    // 🔥 CHECK ALL PAID
    const members = await this.prisma.bridalPartyMember.findMany({
      where: { eventId: bridalPayment.eventId },
    });

    const allPaid = members.every((m) => m.status === 'paid');

    if (allPaid) {
      await this.createGroupOrder(bridalPayment.eventId);
    }

    return { message: 'Payment processed' };
  }

  // ❌ FAILURE
  async handleFailure(paymentIntentId: string) {
    return this.prisma.order.updateMany({
      where: { paymentId: paymentIntentId },
      data: { status: 'FAILED' },
    });
  }

  // 🔥 GROUP ORDER CREATION (moved here to avoid circular deps)
  async createGroupOrder(eventId: string) {
    const selections = await this.prisma.bridalPartySelection.findMany({
      where: { eventId },
    });

    if (!selections.length) {
      throw new Error('No selections found');
    }

    const event = await this.prisma.bridalPartyEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) throw new Error('Event not found');

    const items = selections.map((s) => ({
      productId: s.productId,
      quantity: 1,
      price: 100,
    }));

    const total = items.reduce((sum, i) => sum + i.price, 0);

    await this.prisma.order.create({
      data: {
        userId: event.organizerUserId,
        total,
        status: 'PENDING',
        items: {
          create: items,
        },
      },
    });

    await this.prisma.bridalPartyEvent.update({
      where: { id: eventId },
      data: { status: 'ordered' },
    });
  }
}