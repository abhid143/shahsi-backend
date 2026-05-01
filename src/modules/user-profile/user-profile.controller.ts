import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateMeasurementsDto } from './dto/update-measurements.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('User Profile')
@ApiBearerAuth()
@Controller('user-profile')
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  constructor(private service: UserProfileService) {}

  // 📌 CREATE
  @Post()
  @ApiOperation({ summary: 'Create user profile' })
  create(@Req() req, @Body() dto: CreateProfileDto) {
    return this.service.createProfile(req.user.userId, dto);
  }

  // 📌 GET
  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  get(@Req() req) {
    return this.service.getProfile(req.user.userId);
  }

  // 📌 UPDATE FULL
  @Patch()
  @ApiOperation({ summary: 'Update full profile' })
  update(@Req() req, @Body() dto: CreateProfileDto) {
    return this.service.updateProfile(req.user.userId, dto);
  }

  // 📌 UPDATE MEASUREMENTS
  @Patch('measurements')
  @ApiOperation({ summary: 'Update measurements only' })
  updateMeasurements(@Req() req, @Body() dto: UpdateMeasurementsDto) {
    return this.service.updateMeasurements(req.user.userId, dto);
  }
}