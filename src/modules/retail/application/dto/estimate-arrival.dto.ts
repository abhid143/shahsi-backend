import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class EstimateArrivalDto {
  @ApiProperty({ example: 'product_id_123' })
  @IsString()
  productId!: string;

  @ApiPropertyOptional({ example: 'variant_id_123' })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ enum: ['STANDARD', 'RUSH'] })
  @IsIn(['STANDARD', 'RUSH'])
  deliveryOption!: 'STANDARD' | 'RUSH';

  @ApiProperty({ enum: ['STANDARD', 'CUSTOM'] })
  @IsIn(['STANDARD', 'CUSTOM'])
  sizeType!: 'STANDARD' | 'CUSTOM';
}