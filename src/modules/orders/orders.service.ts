import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // ✅ CART → ORDER CREATE
  async createOrderFromCart(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    let total = 0;

    const items = cart.items.map((item) => {
      const price = 100;
      total += price * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
      };
    });

    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        status: 'PENDING',
        items: {
          create: items,
        },
      },
      include: {
        items: true, // ✅ FIXED (works after prisma generate)
      },
    });

    // ✅ clear cart after order
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return order;
  }

  // ✅ PAYMENT SUCCESS
  async markOrderPaid(paymentId: string) {
    return this.prisma.order.updateMany({
      where: { paymentId },
      data: {
        status: 'PAID',
      },
    });
  }

  // ❌ PAYMENT FAILED
  async markOrderFailed(paymentId: string) {
    return this.prisma.order.updateMany({
      where: { paymentId },
      data: {
        status: 'FAILED',
      },
    });
  }

  // 🔗 LINK PAYMENT → ORDER
  async attachPayment(orderId: string, paymentId: string) {
    return this.prisma.order.update({
      where: { id: orderId }, // ✅ unique field
      data: { paymentId },
    });
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
    });
  }
}