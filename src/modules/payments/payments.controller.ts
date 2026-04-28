import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './application/payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post('create')
  create(@Body() body: CreatePaymentDto) {
    return this.payments.createPayment(body.orderId);
  }
}