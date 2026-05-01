import { Controller, Post, Body } from '@nestjs/common';
import { StyleEngineService } from './style-engine.service';
import { StyleRequestDto } from './dto/style-request.dto';

@Controller('style')
export class StyleEngineController {
  constructor(private style: StyleEngineService) {}

  @Post('analyze')
  analyze(@Body() dto: StyleRequestDto) {
    return this.style.analyzeStyle(dto);
  }
}