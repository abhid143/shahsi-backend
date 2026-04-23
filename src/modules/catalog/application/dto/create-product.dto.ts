import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class VariantDto {
  @ApiProperty({ example: 'M' })
  @IsString()
  size!: string;

  @ApiProperty({ example: 1999 })
  @IsNumber()
  price!: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  stock!: number;

  @ApiProperty({ example: 'SKU123' })
  @IsString()
  sku!: string;
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  category!: string;

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

  @ApiProperty({ type: [VariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants!: VariantDto[];
}