import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecommendationRequestDto {

  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty({ example: 170 })
  @IsNumber()
  height!: number;

  @ApiProperty({ example: 65 })
  @IsNumber()
  weight!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  chest?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  waist?: number;

  @ApiPropertyOptional({ example: 'retail' })
  @IsOptional()
  @IsString()
  businessModel?: 'retail' | 'rental' | 'subscription';

  // 🔥 NEW (FIX FOR ERROR)
  @ApiPropertyOptional({ example: 'dark' })
  @IsOptional()
  @IsString()
  skinTone?: string;

  @ApiPropertyOptional({ example: 'blue' })
  @IsOptional()
  @IsString()
  colorPreference?: string;
}