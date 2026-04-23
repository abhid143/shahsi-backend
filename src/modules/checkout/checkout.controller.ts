import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('checkout')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Post()
  checkout(@Req() req) {
    return this.checkoutService.checkout(req.user.userId);
  }
}