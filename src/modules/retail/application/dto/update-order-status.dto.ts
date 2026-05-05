import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../domain/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}