import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

class ImageDto {
  @ApiProperty()
  @IsString()
  url!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  alt?: string;

  @ApiProperty({ default: false })
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  compareAtPrice?: number;

  @ApiProperty()
  @IsNumber()
  stock!: number;

  @ApiProperty()
  @IsString()
  sku!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  barcode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  weight?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  weightUnit?: string;
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  slug!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  brand?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  fabric?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  occasion?: string;

  // 🔥 NEW FIELDS
  @ApiProperty({ required: false })
  @IsOptional()
  composition?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  style?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  print?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  badge?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  primaryCollection?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  secondaryCollection?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  basePrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  currency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  seoTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  seoDescription?: string;

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