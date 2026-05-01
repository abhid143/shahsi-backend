import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { DatabaseModule } from '../../infra/database/database.module';
import { AppCacheModule } from '../../infra/cache/cache.module';
import { SearchModule } from '../search/search.module';
import { AiModule } from '../ai/ai.module';

// ✅ ADD THIS IMPORT
import { FitEngineModule } from '../fit-engine/fit-engine.module';

@Module({
  imports: [
    DatabaseModule,
    AppCacheModule,
    SearchModule,
    AiModule,

    // 🔥 FIX: ADD THIS
    FitEngineModule,
  ],
  providers: [CatalogService],
  controllers: [CatalogController],
})
export class CatalogModule {}