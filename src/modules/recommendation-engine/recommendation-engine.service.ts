import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { FitEngineService } from '../fit-engine/fit-engine.service';
import { RecommendationRequestDto } from './dto/recommendation-request.dto';
import { StyleEngineService } from '../style-engine/style-engine.service';

@Injectable()
export class RecommendationEngineService {
  constructor(
    private prisma: PrismaService,
    private fitEngine: FitEngineService,
    private style: StyleEngineService
  ) {}

  async recommend(dto: RecommendationRequestDto) {

    // 🔥 1. FETCH PRODUCT
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: { variants: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (!product.variants || product.variants.length === 0) {
      return {
        recommendedSize: null,
        confidence: 'low',
        fit: null,
        explanation: {
          summary: 'Size recommendation unavailable',
          fitSummary: 'Product does not have size data',
        },
      };
    }

    // 🔥 2. MAP VARIANTS → FIT ENGINE INPUT
    const sizes = product.variants
      .filter(v => v.chest && v.waist)
      .map(v => ({
        label: v.size,
        chest: v.chest,
        waist: v.waist,
      }));

    if (sizes.length === 0) {
      return {
        recommendedSize: null,
        confidence: 'low',
        fit: null,
        explanation: {
          summary: 'Size data missing',
          fitSummary: 'No valid measurement data available',
        },
      };
    }

    // 🔥 3. SAFE FIT TYPE
    const rawFitType = product.variants[0].fitType;

    const fitType: 'slim' | 'regular' | 'oversized' =
      rawFitType === 'slim' || rawFitType === 'oversized'
        ? rawFitType
        : 'regular';

    // 🔥 4. CALL FIT ENGINE
    const height = dto.height || 170;
    const weight = dto.weight || 65;

    const fitResult = this.fitEngine.calculateFit({
      height,
      weight,
      chest: dto.chest,
      waist: dto.waist,
      fitType,
      sizes,
    });

    // 🔥 5. STYLE ENGINE (FIXED NULL ISSUE)
    let styleResult: any = null;

    try {
      styleResult = this.style.analyzeStyle({
        color: product.color ?? undefined, // ✅ FIXED HERE
      });
    } catch {
      styleResult = null;
    }

    // 🔥 6. FEEDBACK ANALYSIS
    const feedbacks = await this.prisma.fitFeedback.findMany({
      where: {
        productId: dto.productId,
      },
    });

    let tooSmall = 0;
    let tooLarge = 0;
    let perfect = 0;

    feedbacks.forEach(f => {
      if (f.result === 'too_small') tooSmall++;
      if (f.result === 'too_large') tooLarge++;
      if (f.result === 'perfect') perfect++;
    });

    let adjustment: 'size_up' | 'size_down' | null = null;
    let feedbackMessage = '';

    if (tooSmall > perfect && tooSmall > tooLarge) {
      adjustment = 'size_up';
      feedbackMessage = 'Most users reported this runs small';
    }

    if (tooLarge > perfect && tooLarge > tooSmall) {
      adjustment = 'size_down';
      feedbackMessage = 'Most users reported this runs large';
    }

    // 🔥 7. APPLY SIZE ADJUSTMENT
    let finalSize = fitResult.recommendedSize;

    const sizeIndex = sizes.findIndex(
      v => v.label === fitResult.recommendedSize,
    );

    if (adjustment === 'size_up' && sizeIndex !== -1 && sizeIndex < sizes.length - 1) {
      finalSize = sizes[sizeIndex + 1].label;
    }

    if (adjustment === 'size_down' && sizeIndex > 0) {
      finalSize = sizes[sizeIndex - 1].label;
    }

    // 🔥 8. BUSINESS LOGIC
    let recommendation = { ...fitResult, recommendedSize: finalSize };

    if (dto.businessModel === 'rental') {
      if (recommendation.confidence === 'low' && recommendation.alternatives.length) {
        recommendation.recommendedSize = recommendation.alternatives[0];
      }

      if (recommendation.fitDetails?.chest === 'tight') {
        const alt = recommendation.alternatives?.[0];
        if (alt) recommendation.recommendedSize = alt;
      }
    }

    // 🔥 9. CONFIDENCE IMPROVEMENT
    let confidence = recommendation.confidence;

    if (feedbacks.length > 5) {
      confidence = 'high';
    } else if (feedbacks.length > 2) {
      confidence = 'medium';
    }

    // 🔥 10. FINAL RESPONSE
    return {
      recommendedSize: recommendation.recommendedSize,
      confidence,
      fit: recommendation.fitDetails,
      style: styleResult || undefined,
      explanation: {
        summary: `Recommended size: ${recommendation.recommendedSize || 'N/A'}`,
        fitSummary: recommendation.fitDetails
          ? `Chest is ${recommendation.fitDetails.chest}, waist is ${recommendation.fitDetails.waist}`
          : 'Fit data unavailable',
        alternative: adjustment === 'size_up'
          ? 'Consider sizing up for comfort'
          : adjustment === 'size_down'
          ? 'Consider sizing down for better fit'
          : recommendation.alternatives?.[0]
          ? `Try ${recommendation.alternatives[0]} for comfort`
          : undefined,
        feedback: feedbackMessage || undefined,
      },
    };
  }
}