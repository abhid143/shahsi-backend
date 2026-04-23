import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class CheckoutService {
  constructor(private prisma: PrismaService) {}

  async checkout(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // 👉 Fake total (later product price add karenge)
    const total = cart.items.reduce((sum, item) => sum + item.quantity * 100, 0);

    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
      },
    });

    // clear cart after checkout
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return order;
  }
}