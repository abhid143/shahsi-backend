import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class PayDto {
  @ApiProperty()
  @IsString()
  memberId!: string;

  @ApiProperty({ example: 2000 })
  @IsNumber()
  amount!: number;
}