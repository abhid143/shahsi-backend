import { Body, Controller, Post, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './application/dto/login.dto';
import { RegisterDto } from './application/dto/register.dto';

import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @ApiOperation({ summary: 'Register user' })
  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.auth.register(body.email, body.password);
  }

  @ApiOperation({ summary: 'Login user' })
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @Get('me')
  getProfile(@Request() req) {
    return {
      message: 'User profile fetched',
      user: req.user,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin only route' })
  @Get('admin')
  getAdminData(@Request() req) {
    return {
      message: 'Admin access granted',
      user: req.user,
    };
  }
}