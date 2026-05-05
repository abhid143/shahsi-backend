import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class CheckoutService {
  constructor(private prisma: PrismaService) {}

  async checkout(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let total = 0;

    const orderItems: any[] = [];

    for (const item of cart.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!product) {
        throw new BadRequestException('Product not found');
      }

      const variant = item.variantId
        ? product.variants.find((v) => v.id === item.variantId)
        : null;

      const basePrice = variant?.price ?? product.basePrice ?? 0;

      const rushFee =
        item.deliveryOption === 'RUSH' && product.rushFee
          ? product.rushFee
          : 0;

      const price = basePrice + rushFee;

      total += price * item.quantity;

      const productionType =
        product.isMadeToOrder || item.sizeType === 'CUSTOM'
          ? 'MADE_TO_ORDER'
          : variant?.isShipsNow
            ? 'READY_STOCK'
            : product.productionType;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price,

        sizeType: item.sizeType,
        bust: item.bust,
        waist: item.waist,
        hips: item.hips,
        hollowToFloor: item.hollowToFloor,
        heightBareFoot: item.heightBareFoot,
        extraLength: item.extraLength,

        customSizingAccepted: item.customSizingAccepted,
        productionType,
        deliveryOption: item.deliveryOption,
        estimatedArrivalStart: item.estimatedArrivalStart,
        estimatedArrivalEnd: item.estimatedArrivalEnd,

        finalSale:
          item.sizeType === 'CUSTOM' && product.customSizingFinalSale,
      });
    }

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

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return {
      message: 'Order created successfully',
      order,
    };
  }
}