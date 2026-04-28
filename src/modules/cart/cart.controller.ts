import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cart: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  getCart(@Req() req) {
    return this.cart.getCart(req.user.userId);
  }

  @Post('add')
  @ApiOperation({ summary: 'Add product to cart' })
  add(@Req() req, @Body() body: AddToCartDto) {
    return this.cart.addToCart(
      req.user.userId,
      body.productId,
      body.quantity,
    );
  }

  @Delete('remove/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  remove(@Param('id') id: string) {
    return this.cart.removeFromCart(id);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear cart' })
  clear(@Req() req) {
    return this.cart.clearCart(req.user.userId);
  }
}