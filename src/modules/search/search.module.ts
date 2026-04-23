import { Module, OnModuleInit } from '@nestjs/common';
import { SearchService } from './application/search.service';
import { SearchController } from './interfaces/search.controller';
import { TypesenseService } from './infrastructure/typesense.service';
import { AiModule } from '../ai/ai.module';

// 🔥 IMPORTANT
import { DatabaseModule } from '../../infra/database/database.module';

@Module({
  imports: [
    AiModule,
    DatabaseModule, // 🔥 FIX: PrismaService available now
  ],
  providers: [SearchService, TypesenseService],
  controllers: [SearchController],
  exports: [TypesenseService],
})
export class SearchModule implements OnModuleInit {
  constructor(private readonly typesense: TypesenseService) {}

  async onModuleInit() {
    await this.typesense.ensureCollection(); // collection auto-create
  }
}