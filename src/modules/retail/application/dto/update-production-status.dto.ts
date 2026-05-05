import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateProductionStatusDto {
  @ApiProperty({
    enum: [
      'PRODUCTION_TICKET_CREATED',
      'FABRIC_CUTTING',
      'SEWING',
      'QUALITY_CHECK',
      'READY_TO_SHIP',
    ],
  })
  @IsIn([
    'PRODUCTION_TICKET_CREATED',
    'FABRIC_CUTTING',
    'SEWING',
    'QUALITY_CHECK',
    'READY_TO_SHIP',
  ])
  status!: string;
}