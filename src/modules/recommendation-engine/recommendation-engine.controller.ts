import { Controller, Post, Body } from '@nestjs/common';
import { RecommendationEngineService } from './recommendation-engine.service';
import { RecommendationRequestDto } from './dto/recommendation-request.dto';
import { ApiResponse } from '../../shared/utils/api-response';

@Controller('recommendation')
export class RecommendationEngineController {
  constructor(private service: RecommendationEngineService) {}

  @Post()
  async recommend(@Body() body: RecommendationRequestDto) {
    const data = await this.service.recommend(body);
    return ApiResponse.success(data);
  }
}