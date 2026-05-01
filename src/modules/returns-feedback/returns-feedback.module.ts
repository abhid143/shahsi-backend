import { Module } from '@nestjs/common';
import { ReturnsFeedbackService } from './returns-feedback.service';
import { ReturnsFeedbackController } from './returns-feedback.controller';
import { DatabaseModule } from '../../infra/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ReturnsFeedbackService],
  controllers: [ReturnsFeedbackController],
  exports: [ReturnsFeedbackService], // 🔥 future use (Recommendation Engine)
})
export class ReturnsFeedbackModule {}