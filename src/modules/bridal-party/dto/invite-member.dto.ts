import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class InviteMemberDto {
  @ApiProperty()
  @IsString()
  eventId!: string;

  @ApiProperty({ example: 'friend@gmail.com' })
  @IsEmail()
  email!: string;
}