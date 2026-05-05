import { Module } from '@nestjs/common';
import { RetailService } from './application/retail.service';
import { RetailController } from './interfaces/retail.controller';
import { RetailRepository } from './infrastructure/retail.repository';
import { DatabaseModule } from '../../infra/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RetailController],
  providers: [RetailService, RetailRepository],
})
export class RetailModule {}