import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cart: CartService) {}

  @Get()
  getCart(@Req() req) {
    return this.cart.getCart(req.user.userId);
  }

  @Post('add')
  add(@Req() req, @Body() body: any) {
    return this.cart.addToCart(
      req.user.userId,
      body.productId,
      body.quantity,
    );
  }

  @Delete('remove/:id')
  remove(@Param('id') id: string) {
    return this.cart.removeFromCart(id);
  }

  @Delete('clear')
  clear(@Req() req) {
    return this.cart.clearCart(req.user.userId);
  }
}