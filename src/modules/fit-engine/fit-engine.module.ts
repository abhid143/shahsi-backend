import { Module } from '@nestjs/common';
import { FitEngineService } from './fit-engine.service';
import { FitEngineController } from './fit-engine.controller';
import { PrismaService } from '../../infra/database/prisma.service';

@Module({
  providers: [FitEngineService, PrismaService],
  controllers: [FitEngineController],
  exports: [FitEngineService],
})
export class FitEngineModule {}