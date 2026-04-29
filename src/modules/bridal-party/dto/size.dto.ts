import { IsString, IsNotEmpty } from 'class-validator';

export class SizeDto {
  @IsString()
  @IsNotEmpty()
  memberId!: string;

  @IsString()
  @IsNotEmpty()
  size!: string;

  @IsString()
  preference!: string;
}