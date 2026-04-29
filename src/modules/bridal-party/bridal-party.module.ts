import { Module, forwardRef } from '@nestjs/common';
import { BridalPartyService } from './bridal-party.service';
import { BridalPartyController } from './bridal-party.controller';
import { DatabaseModule } from '../../infra/database/database.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => PaymentsModule), // ✅ FIX
  ],
  providers: [BridalPartyService],
  controllers: [BridalPartyController],
  exports: [BridalPartyService], // ✅ IMPORTANT (needed by Payments)
})
export class BridalPartyModule {}