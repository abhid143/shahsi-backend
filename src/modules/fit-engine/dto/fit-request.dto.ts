import { IsNumber, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SizeInput {
  @ApiProperty({ example: 'M' })
  label!: string;

  @ApiProperty({ example: 98 })
  chest!: number;

  @ApiProperty({ example: 85 })
  waist!: number;

  // 🔥 NEW: fitType per size (DB compatible)
  @ApiPropertyOptional({ example: 'regular' })
  @IsOptional()
  @IsString()
  fitType?: 'slim' | 'regular' | 'oversized';
}

export class FitRequestDto {

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

  @ApiPropertyOptional({ example: 'regular' })
  @IsOptional()
  @IsString()
  fitType?: 'slim' | 'regular' | 'oversized';

  // 🔥 MULTI SIZE INPUT
  @ApiProperty({
    type: [SizeInput],
    example: [
      { label: 'S', chest: 94, waist: 80, fitType: 'slim' },
      { label: 'M', chest: 98, waist: 85, fitType: 'regular' },
      { label: 'L', chest: 104, waist: 90, fitType: 'oversized' }
    ]
  })
  @IsArray()
  sizes!: SizeInput[];
}