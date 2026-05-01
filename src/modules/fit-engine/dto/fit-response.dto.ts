import { ApiProperty } from '@nestjs/swagger';

export class FitResponseDto {

  @ApiProperty()
  recommendedSize!: string;

  @ApiProperty()
  alternatives!: string[];

  @ApiProperty()
  confidence!: 'high' | 'medium' | 'low';

  @ApiProperty()
  fitDetails: any;

  @ApiProperty()
  explanation!: string;
}