import {
  Controller,
  Patch,
  Param,
  Body,
  Post,
} from '@nestjs/common';
import { RetailService } from '../application/retail.service';
import { UpdateOrderStatusDto } from '../application/dto/update-order-status.dto';
import { ApplyCouponDto } from '../application/dto/apply-coupon.dto';
import { UpdateProductionStatusDto } from '../application/dto/update-production-status.dto';
import { EstimateArrivalDto } from '../application/dto/estimate-arrival.dto';
import { CreateShipmentDto } from '../application/dto/create-shipment.dto';

@Controller('retail')
export class RetailController {
  constructor(private retail: RetailService) {}

  @Post(':orderId/confirm')
  confirm(@Param('orderId') orderId: string) {
    return this.retail.confirmOrder(orderId);
  }

  @Patch(':orderId/status')
  updateStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.retail.updateOrderStatus(orderId, dto);
  }

  @Post(':orderId/shipment')
  createShipment(
    @Param('orderId') orderId: string,
    @Body() dto: CreateShipmentDto,
  ) {
    return this.retail.createShipment(orderId, dto);
  }

  @Patch('shipment/:shipmentId/status')
  updateShipment(
    @Param('shipmentId') shipmentId: string,
    @Body('status') status: string,
  ) {
    return this.retail.updateShipmentStatus(shipmentId, status);
  }

  @Post(':orderId/coupon')
  applyCoupon(
    @Param('orderId') orderId: string,
    @Body() dto: ApplyCouponDto,
  ) {
    return this.retail.applyCoupon(orderId, dto.code);
  }

  @Post('estimate-arrival')
  estimateArrival(@Body() dto: EstimateArrivalDto) {
    return this.retail.estimateArrival(dto);
  }

  @Patch(':orderId/production-status')
  updateProductionStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateProductionStatusDto,
  ) {
    return this.retail.updateProductionStatus(orderId, dto.status);
  }
}