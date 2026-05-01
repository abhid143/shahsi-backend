import { IsOptional, IsString, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StyleRequestDto {

  @ApiPropertyOptional({ example: 'medium' })
  @IsOptional()
  @IsString()
  skinTone?: 'fair' | 'medium' | 'dark';

  @ApiPropertyOptional({ example: 'navy' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    example: ['navy', 'black', 'white']
  })
  @IsOptional()
  @IsArray()
  preferredColors?: string[];

  @ApiPropertyOptional({ example: 'modest' })
  @IsOptional()
  @IsString()
  modestyPreference?: 'modest' | 'regular';

  @ApiPropertyOptional({ example: 'dress' })
  @IsOptional()
  @IsString()
  category?: string;
}