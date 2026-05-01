import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateMeasurementsDto } from './dto/update-measurements.dto';

@Injectable()
export class UserProfileService {
  constructor(private prisma: PrismaService) {}

  // ✅ CREATE PROFILE
  async createProfile(userId: string, dto: CreateProfileDto) {
    return this.prisma.userProfile.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  // ✅ GET PROFILE
  async getProfile(userId: string) {
    return this.prisma.userProfile.findUnique({
      where: { userId },
    });
  }

  // ✅ UPDATE FULL PROFILE
  async updateProfile(userId: string, dto: CreateProfileDto) {
    return this.prisma.userProfile.update({
      where: { userId },
      data: dto,
    });
  }

  // ✅ UPDATE MEASUREMENTS ONLY
  async updateMeasurements(userId: string, dto: UpdateMeasurementsDto) {
    return this.prisma.userProfile.update({
      where: { userId },
      data: dto,
    });
  }
}