import { Module } from '@nestjs/common';
import { StyleEngineService } from './style-engine.service';
import { StyleEngineController } from './style-engine.controller';

@Module({
  providers: [StyleEngineService],
  controllers: [StyleEngineController],
  exports: [StyleEngineService], // 🔥 important (Recommendation Engine use karega)
})
export class StyleEngineModule {}