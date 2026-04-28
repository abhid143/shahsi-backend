import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Checkout')
@ApiBearerAuth() // ✅ VERY IMPORTANT
@Controller('checkout')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Post()
  @ApiOperation({ summary: 'Create order from cart and initiate payment' })
  checkout(@Req() req) {
    return this.checkoutService.checkout(req.user.userId);
  }
}