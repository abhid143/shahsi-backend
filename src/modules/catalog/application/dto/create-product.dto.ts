import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ProductMode {
  RETAIL = 'retail',
  MADE_TO_ORDER = 'made_to_order',
  RENTAL = 'rental',
  RESALE = 'resale',
}

export enum ProductProductionType {
  READY_STOCK = 'READY_STOCK',
  MADE_TO_ORDER = 'MADE_TO_ORDER',
  HYBRID = 'HYBRID',
}

export enum VariantProductionType {
  READY_STOCK = 'READY_STOCK',
  MADE_TO_ORDER = 'MADE_TO_ORDER',
}

class ImageDto {
  @ApiProperty()
  @IsString()
  url!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

class VariantDto {
  @ApiProperty()
  @IsString()
  size!: string;

  @ApiProperty()
  @IsNumber()
  price!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  compareAtPrice?: number;

  @ApiProperty()
  @IsNumber()
  stock!: number;

  @ApiProperty()
  @IsString()
  sku!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  weightUnit?: string;

  // FIT ENGINE FIELDS
  @ApiPropertyOptional({ example: 98 })
  @IsOptional()
  @IsNumber()
  chest?: number;

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsNumber()
  waist?: number;

  @ApiPropertyOptional({ example: 110 })
  @IsOptional()
  @IsNumber()
  length?: number;

  @ApiPropertyOptional({ example: 'regular', enum: ['slim', 'regular', 'oversized'] })
  @IsOptional()
  @IsIn(['slim', 'regular', 'oversized'])
  fitType?: 'slim' | 'regular' | 'oversized';

  // SHIPS NOW / VARIANT PRODUCTION
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isShipsNow?: boolean;

  @ApiPropertyOptional({
    example: VariantProductionType.READY_STOCK,
    enum: VariantProductionType,
  })
  @IsOptional()
  @IsEnum(VariantProductionType)
  productionType?: VariantProductionType;
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  slug!: string;

  @ApiProperty({ enum: ProductMode, example: ProductMode.RETAIL })
  @IsEnum(ProductMode)
  mode!: ProductMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fabric?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  occasion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  composition?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  style?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  print?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  badge?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryCollection?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secondaryCollection?: string;

  @ApiPropertyOptional({ example: 99 })
  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescription?: string;

  // PRODUCT LEVEL MTO CONFIG
  @ApiPropertyOptional({
    example: ProductProductionType.HYBRID,
    enum: ProductProductionType,
  })
  @IsOptional()
  @IsEnum(ProductProductionType)
  productionType?: ProductProductionType;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isMadeToOrder?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  allowCustomSizing?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  allowRushProduction?: boolean;

  @ApiPropertyOptional({ example: 21 })
  @IsOptional()
  @IsNumber()
  standardLeadTimeDays?: number;

  @ApiPropertyOptional({ example: 14 })
  @IsOptional()
  @IsNumber()
  rushLeadTimeDays?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  rushFee?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  customSizingFinalSale?: boolean;

  @ApiProperty({ type: [ImageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images!: ImageDto[];

  @ApiProperty({ type: [VariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants!: VariantDto[];
}