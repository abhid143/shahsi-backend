import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RetailRepository } from '../infrastructure/retail.repository';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { EstimateArrivalDto } from './dto/estimate-arrival.dto';
import { PrismaService } from '../../../infra/database/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';

@Injectable()
export class RetailService {
  constructor(
    private repo: RetailRepository,
    private prisma: PrismaService,
  ) {}

  async confirmOrder(orderId: string) {
    const order = await this.repo.findOrderById(orderId);

    if (!order) throw new NotFoundException('Order not found');

    await this.repo.reduceStock(order.items);

    const hasMadeToOrder = order.items.some(
      (item: any) => item.productionType === 'MADE_TO_ORDER',
    );

    if (hasMadeToOrder) {
      return this.repo.updateOrderStatus(orderId, 'PRODUCTION_TICKET_CREATED');
    }

    return this.repo.updateOrderStatus(orderId, 'CONFIRMED');
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    return this.repo.updateOrderStatus(orderId, dto.status);
  }

  async updateProductionStatus(orderId: string, status: string) {
    const order = await this.repo.findOrderById(orderId);

    if (!order) throw new NotFoundException('Order not found');

    const allowed = [
      'PRODUCTION_TICKET_CREATED',
      'FABRIC_CUTTING',
      'SEWING',
      'QUALITY_CHECK',
      'READY_TO_SHIP',
    ];

    if (!allowed.includes(status)) {
      throw new BadRequestException('Invalid production status');
    }

    return this.repo.updateOrderStatus(orderId, status);
  }

  async estimateArrival(dto: EstimateArrivalDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: { variants: true },
    });

    if (!product) throw new NotFoundException('Product not found');

    const variant = dto.variantId
      ? product.variants.find((v) => v.id === dto.variantId)
      : null;

    const isReadyStock = variant?.isShipsNow === true;

    const leadDays =
      isReadyStock
        ? 7
        : dto.deliveryOption === 'RUSH' && product.rushLeadTimeDays
          ? product.rushLeadTimeDays
          : product.standardLeadTimeDays;

    const start = new Date();
    start.setDate(start.getDate() + leadDays);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
      productId: dto.productId,
      variantId: dto.variantId,
      sizeType: dto.sizeType,
      deliveryOption: dto.deliveryOption,
      productionType:
        isReadyStock && dto.sizeType !== 'CUSTOM'
          ? 'READY_STOCK'
          : 'MADE_TO_ORDER',
      estimatedArrivalStart: start,
      estimatedArrivalEnd: end,
      message:
        isReadyStock && dto.sizeType !== 'CUSTOM'
          ? 'Ships Now item. Ready-stock delivery estimate.'
          : 'Made-to-order item. Production starts after purchase.',
    };
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
          trackingNumber: data?.trackingNumber ?? `TRK-${Date.now()}`,
          carrier: data?.carrier ?? 'Delhivery',
        },
      });
    }

  async updateShipmentStatus(shipmentId: string, status: string) {
    return this.repo.updateShipmentStatus(shipmentId, status);
  }

  async applyCoupon(orderId: string, code: string) {
    let discount = 0;

    if (code === 'SAVE10') discount = 10;
    if (code === 'SAVE20') discount = 20;

    if (!discount) {
      throw new BadRequestException('Invalid coupon');
    }

    return this.repo.applyCoupon(orderId, discount);
  }
}