import { IsString, IsNotEmpty } from 'class-validator';

export class AssignDressDto {
  @IsString()
  @IsNotEmpty()
  memberId!: string;

  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsString()
  variantId?: string;
}