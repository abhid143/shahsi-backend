import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateShipmentDto {
  @ApiPropertyOptional({ example: 'TRK-1777886466393' })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({ example: 'Delhivery' })
  @IsOptional()
  @IsString()
  carrier?: string;
}