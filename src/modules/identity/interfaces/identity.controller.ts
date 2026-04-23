import { Controller, Post, Body } from '@nestjs/common';
import { IdentityService } from '../application/identity.service';
import { RegisterDto, LoginDto } from '../application/dto/auth.dto';

@Controller('auth')
export class IdentityController {
  private service = new IdentityService();

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.service.register(body.email, body.password);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.service.login(body.email, body.password);
  }
}