import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ReturnsFeedbackService } from './returns-feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Controller('feedback')
export class ReturnsFeedbackController {
  constructor(private feedback: ReturnsFeedbackService) {}

  // 🔥 submit feedback
  @Post()
  async create(@Body() dto: CreateFeedbackDto) {
    const data = await this.feedback.createFeedback(dto);
    return {
      success: true,
      data,
    };
  }

  // 🔥 get product insights (learning layer)
  @Get('insights')
  async insights(@Query('productId') productId: string) {
    const data = await this.feedback.getProductInsights(productId);
    return {
      success: true,
      data,
    };
  }
}