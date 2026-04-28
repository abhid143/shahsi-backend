import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    return cart;
  }

  async addToCart(userId: string, productId: string, quantity: number) {
    const cart = await this.getCart(userId);

    // 🔥 CHECK if product already exists in cart
    const existing = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existing) {
      // 🔥 UPDATE quantity instead of duplicate
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + quantity,
        },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  async removeFromCart(itemId: string) {
    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(userId: string) {
    const cart = await this.getCart(userId);

    return this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }
}