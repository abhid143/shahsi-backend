import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getMyOrders(@Request() req) {
    return this.orders.getUserOrders(req.user.userId);
  }
}