import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';

@Injectable()
export class RetailRepository {
  constructor(private prisma: PrismaService) {}

  findOrderById(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
  }

  updateOrderStatus(orderId: string, status: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });
  }

  async reduceStock(items: any[]) {
    for (const item of items) {
      if (!item.variantId) continue;

      if (item.productionType === 'MADE_TO_ORDER') {
        continue;
      }

      await this.prisma.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }
  }

    async createShipment(
    orderId: string,
    data?: {
      trackingNumber?: string;
      carrier?: string;
    },
  ) {
    return this.prisma.shipment.create({
      data: {
        orderId,
        status: 'created',
        trackingNumber: data?.trackingNumber ?? null,
        carrier: data?.carrier ?? null,
      },
    });
  }

  updateShipmentStatus(shipmentId: string, status: string) {
    return this.prisma.shipment.update({
      where: { id: shipmentId },
      data: { status },
    });
  }

  async applyCoupon(orderId: string, discount: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return null;

    const newAmount = order.total - (order.total * discount) / 100;

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        total: newAmount,
      },
    });
  }
}