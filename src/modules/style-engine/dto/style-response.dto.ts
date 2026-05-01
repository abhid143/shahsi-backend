import { ApiProperty } from '@nestjs/swagger';

export class StyleResponseDto {

  @ApiProperty()
  styleScore!: number;

  @ApiProperty()
  style!: {
    color_match: string;
    reason: string;
  };
}