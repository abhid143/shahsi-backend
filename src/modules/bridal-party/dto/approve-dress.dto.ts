import { IsString, IsNotEmpty } from 'class-validator';

export class ApproveDressDto {
  @IsString()
  @IsNotEmpty()
  memberId!: string;

  @IsString()
  @IsNotEmpty()
  selectionId!: string;
}