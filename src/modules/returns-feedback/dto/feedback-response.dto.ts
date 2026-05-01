import { ApiProperty } from '@nestjs/swagger';

export class FeedbackResponseDto {

  @ApiProperty()
  total!: number;

  @ApiProperty()
  distribution!: {
    too_small: number;
    perfect: number;
    too_large: number;
  };

  @ApiProperty()
  percentages!: {
    too_small: number;
    perfect: number;
    too_large: number;
  };

  @ApiProperty()
  commonIssues!: Record<string, number>;
}