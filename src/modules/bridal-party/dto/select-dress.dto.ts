import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class SelectDressDto {
  @ApiProperty()
  @IsString()
  memberId!: string;

  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  variantId?: string;
}