import { IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfileDto {

  @ApiPropertyOptional({ example: 170 })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ example: 65 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ example: 95 })
  @IsOptional()
  @IsNumber()
  chest?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsNumber()
  waist?: number;

  @ApiPropertyOptional({ example: 'average' })
  @IsOptional()
  @IsString()
  bodyType?: 'slim' | 'average' | 'broad';

  @ApiPropertyOptional({ example: 'regular' })
  @IsOptional()
  @IsString()
  fitPreference?: 'slim' | 'regular' | 'loose';
}