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

export enum AvailabilityStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  PREORDER = 'preorder',
  MADE_TO_ORDER = 'made_to_order',
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

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  position?: number;

  @ApiPropertyOptional({ example: 'Sage Green' })
  @IsOptional()
  @IsString()
  colorName?: string;
}

class VariantDto {
  @ApiProperty()
  @IsString()
  size!: string;

  @ApiPropertyOptional({ example: 'Sage Green' })
  @IsOptional()
  @IsString()
  color?: string;

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

  @ApiPropertyOptional({
    example: 'regular',
    enum: ['slim', 'regular', 'oversized'],
  })
  @IsOptional()
  @IsIn(['slim', 'regular', 'oversized'])
  fitType?: 'slim' | 'regular' | 'oversized';

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

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

class ProductColorDto {
  @ApiProperty({ example: 'Sage Green' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: '#8A9A5B' })
  @IsOptional()
  @IsString()
  hex?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/swatch.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isSelected?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  position?: number;
}

class ProductReviewDto {
  @ApiPropertyOptional({ example: 'Superb quality apparel' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  rating!: number;

  @ApiPropertyOptional({ example: 'Great product quality.' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ example: 'Customer' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

class RelatedProductDto {
  @ApiProperty({ example: 'related-product-id' })
  @IsString()
  relatedProductId!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  position?: number;
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortDescription?: string;

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
  vendor?: string;

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

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  careInstructions?: string[];

  @ApiPropertyOptional({ example: 99 })
  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @ApiPropertyOptional({ example: 129 })
  @IsOptional()
  @IsNumber()
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

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

  @ApiPropertyOptional({
    example: AvailabilityStatus.IN_STOCK,
    enum: AvailabilityStatus,
  })
  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availabilityStatus?: AvailabilityStatus;

  @ApiPropertyOptional({ example: 'In stock' })
  @IsOptional()
  @IsString()
  availabilityLabel?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  lowStockThreshold?: number;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @IsNumber()
  soldInLastHours?: number;

  @ApiPropertyOptional({ example: 32 })
  @IsOptional()
  @IsNumber()
  soldHoursWindow?: number;

  @ApiPropertyOptional({ example: 28 })
  @IsOptional()
  @IsNumber()
  viewingNow?: number;

  @ApiPropertyOptional({ example: 4.9 })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({ example: 134 })
  @IsOptional()
  @IsNumber()
  reviewCount?: number;

  @ApiPropertyOptional({ example: '3-6 days in United States' })
  @IsOptional()
  @IsString()
  estimatedDomestic?: string;

  @ApiPropertyOptional({ example: '12-26 days international' })
  @IsOptional()
  @IsString()
  estimatedInternational?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  pickupAvailable?: boolean;

  @ApiPropertyOptional({ example: 'Usually ready in 24 hours' })
  @IsOptional()
  @IsString()
  pickupReadyIn?: string;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsNumber()
  returnWindowDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  returnText?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isFinalSale?: boolean;

  @ApiPropertyOptional({ example: 'Shahsi' })
  @IsOptional()
  @IsString()
  storeName?: string;

  @ApiPropertyOptional({ example: 'New York, United States' })
  @IsOptional()
  @IsString()
  storeLocation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storeAddress?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  storePickupAvailable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tabDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tabCompositionCare?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tabShippingReturns?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tabReturnPolicies?: string;

  @ApiPropertyOptional({ example: 4.9 })
  @IsOptional()
  @IsNumber()
  reviewsAverage?: number;

  @ApiPropertyOptional({ example: 168 })
  @IsOptional()
  @IsNumber()
  reviewsTotal?: number;

  @ApiPropertyOptional({ example: 59 })
  @IsOptional()
  @IsNumber()
  review5Count?: number;

  @ApiPropertyOptional({ example: 46 })
  @IsOptional()
  @IsNumber()
  review4Count?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  review3Count?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  review2Count?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  review1Count?: number;

  @ApiPropertyOptional({ example: 'inches' })
  @IsOptional()
  @IsString()
  sizeGuideUnit?: string;

  @ApiPropertyOptional({ type: [String], example: ['visa', 'mastercard'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paymentMethods?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  printSwatch?: string;

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

  @ApiPropertyOptional({ type: [ProductColorDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductColorDto)
  colors?: ProductColorDto[];

  @ApiPropertyOptional({ type: [ProductReviewDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductReviewDto)
  reviews?: ProductReviewDto[];

  @ApiPropertyOptional({ type: [RelatedProductDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelatedProductDto)
  relatedProducts?: RelatedProductDto[];
}