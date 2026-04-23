import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './application/payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post('create')
  create(@Req() req) {
    return this.payments.createPayment(req.user.userId);
  }
}