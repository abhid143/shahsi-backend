import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsBoolean,
  IsIn,
} from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 'product_id_123' })
  @IsString()
  productId!: string;

  @ApiPropertyOptional({ example: 'variant_id_123' })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ example: 'CUSTOM', enum: ['STANDARD', 'CUSTOM'] })
  @IsOptional()
  @IsIn(['STANDARD', 'CUSTOM'])
  sizeType?: 'STANDARD' | 'CUSTOM';

  @ApiPropertyOptional({ example: 36 })
  @IsOptional()
  @IsNumber()
  bust?: number;

  @ApiPropertyOptional({ example: 28 })
  @IsOptional()
  @IsNumber()
  waist?: number;

  @ApiPropertyOptional({ example: 38 })
  @IsOptional()
  @IsNumber()
  hips?: number;

  @ApiPropertyOptional({ example: 58 })
  @IsOptional()
  @IsNumber()
  hollowToFloor?: number;

  @ApiPropertyOptional({ example: 64 })
  @IsOptional()
  @IsNumber()
  heightBareFoot?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  extraLength?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  customSizingAccepted?: boolean;

  @ApiPropertyOptional({ example: 'STANDARD', enum: ['STANDARD', 'RUSH'] })
  @IsOptional()
  @IsIn(['STANDARD', 'RUSH'])
  deliveryOption?: 'STANDARD' | 'RUSH';
}