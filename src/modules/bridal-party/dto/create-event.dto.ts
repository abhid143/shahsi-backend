import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'My Wedding Event' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '2026-12-10T00:00:00.000Z' })
  @IsDateString()
  eventDate!: string;
}