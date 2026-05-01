import { Controller, Post, Body, Param } from '@nestjs/common';
import { FitEngineService } from './fit-engine.service';
import { FitRequestDto } from './dto/fit-request.dto';
import { FitResponseDto } from './dto/fit-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PrismaService } from '../../infra/database/prisma.service';

@ApiTags('Fit Engine')
@Controller('fit')
export class FitEngineController {
  constructor(
    private readonly fitService: FitEngineService,
    private readonly prisma: PrismaService,
  ) {}

  // 🔥 EXISTING API (UNCHANGED)
  @Post('recommend')
  @ApiOperation({ summary: 'Get size recommendation' })
  @ApiBody({ type: FitRequestDto })
  @ApiResponse({ status: 200, type: FitResponseDto })
  getFit(@Body() body: FitRequestDto) {
    return this.fitService.calculateFit(body);
  }

  // 🔥 NEW API: PRODUCT BASED FIT
  @Post('product/:productId')
  @ApiOperation({ summary: 'Get fit recommendation from product variants' })
  @ApiParam({ name: 'productId', type: String })
  @ApiBody({
    schema: {
      example: {
        height: 170,
        weight: 65,
        chest: 96,
        waist: 82,
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Recommended size from product' })
  async getFitFromProduct(
    @Param('productId') productId: string,
    @Body() body: any,
  ) {
    // 1️⃣ PRODUCT FETCH
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // 2️⃣ VARIANTS → FIT ENGINE FORMAT
    const sizes = product.variants.map((v) => ({
      label: v.size,
      chest: v.chest ?? 0,
      waist: v.waist ?? 0,
    }));

    // 3️⃣ SAFE FIT TYPE
    const rawFitType = product.variants[0]?.fitType;

    const fitType: 'slim' | 'regular' | 'oversized' =
      rawFitType === 'slim' || rawFitType === 'oversized'
        ? rawFitType
        : 'regular';

    // 4️⃣ CALL FIT ENGINE
    return this.fitService.calculateFit({
      height: body.height,
      weight: body.weight,
      chest: body.chest,
      waist: body.waist,
      fitType,
      sizes,
    });
  }
}