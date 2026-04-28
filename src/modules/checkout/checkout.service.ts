import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class CheckoutService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async checkout(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    let total = 0;

    const orderItems = cart.items.map((item) => {
      const price = 100; // TODO: replace with real product price
      total += price * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
      };
    });

    // ✅ CREATE ORDER ONLY
    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        status: 'PENDING',
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    // 🧹 CLEAR CART
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return {
      message: 'Order created successfully',
      order,
    };
  }
}