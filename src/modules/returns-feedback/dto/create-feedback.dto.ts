import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeedbackDto {

  @ApiProperty()
  @IsString()
  userId!: string;

  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty({ example: 'M' })
  @IsString()
  size!: string;

  @ApiProperty({ example: 'too_small' })
  @IsString()
  result!: 'too_small' | 'perfect' | 'too_large';

  @ApiPropertyOptional({ example: 'chest' })
  @IsOptional()
  @IsString()
  issueArea?: string;
}