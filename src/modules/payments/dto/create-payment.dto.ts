import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'order_123' })
  @IsString()
  orderId!: string;
}