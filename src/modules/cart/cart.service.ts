import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

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

  async addToCart(userId: string, dto: AddToCartDto) {
    const cart = await this.getCart(userId);

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: { variants: true },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    const sizeType = dto.sizeType ?? 'STANDARD';
    const deliveryOption = dto.deliveryOption ?? 'STANDARD';

    if (sizeType === 'CUSTOM') {
      if (!product.allowCustomSizing) {
        throw new BadRequestException('Custom sizing is not available for this product');
      }

      if (!dto.customSizingAccepted) {
        throw new BadRequestException('Custom sizing terms must be accepted');
      }

      if (
        !dto.bust ||
        !dto.waist ||
        !dto.hips ||
        !dto.hollowToFloor ||
        !dto.heightBareFoot
      ) {
        throw new BadRequestException('Custom measurements are required');
      }
    }

    if (deliveryOption === 'RUSH' && !product.allowRushProduction) {
      throw new BadRequestException('Rush production is not available for this product');
    }

    const today = new Date();
    const leadDays =
      deliveryOption === 'RUSH' && product.rushLeadTimeDays
        ? product.rushLeadTimeDays
        : product.standardLeadTimeDays;

    const estimatedArrivalStart = new Date(today);
    estimatedArrivalStart.setDate(today.getDate() + leadDays);

    const estimatedArrivalEnd = new Date(estimatedArrivalStart);
    estimatedArrivalEnd.setDate(estimatedArrivalStart.getDate() + 6);

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId,
        quantity: dto.quantity,

        sizeType,
        bust: dto.bust,
        waist: dto.waist,
        hips: dto.hips,
        hollowToFloor: dto.hollowToFloor,
        heightBareFoot: dto.heightBareFoot,
        extraLength: dto.extraLength,

        customSizingAccepted: dto.customSizingAccepted ?? false,
        deliveryOption,

        estimatedArrivalStart,
        estimatedArrivalEnd,
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