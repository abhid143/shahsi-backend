import { Module } from '@nestjs/common';
import { RecommendationEngineService } from './recommendation-engine.service';
import { RecommendationEngineController } from './recommendation-engine.controller';
import { FitEngineModule } from '../fit-engine/fit-engine.module';
import { DatabaseModule } from '../../infra/database/database.module';
import { StyleEngineModule } from '../style-engine/style-engine.module';

@Module({
  imports: [FitEngineModule, DatabaseModule, StyleEngineModule],
  providers: [RecommendationEngineService],
  controllers: [RecommendationEngineController],
})
export class RecommendationEngineModule {}