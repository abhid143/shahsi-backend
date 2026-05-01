import { Injectable } from '@nestjs/common';
import { FitRequestDto } from './dto/fit-request.dto';

@Injectable()
export class FitEngineService {

  private estimateChest(h: number, w: number) {
    return (w / h) * 100 + 85;
  }

  private estimateWaist(h: number, w: number) {
    return (w / h) * 90 + 70;
  }

  // 🔥 NEW METHOD ADD
  calculateFromProduct(dto: any) {
    return this.calculateFit({
      height: dto.height,
      weight: dto.weight,
      chest: dto.chest,
      waist: dto.waist,
      fitType: dto.fitType,
      sizes: dto.sizes,
    });
  }

  calculateFit(dto: FitRequestDto) {

    if (!dto.sizes || dto.sizes.length === 0) {
      throw new Error('Sizes data is required');
    }

    const userChest = dto.chest?? this.estimateChest(dto.height, dto.weight);
    const userWaist = dto.waist?? this.estimateWaist(dto.height, dto.weight);

    const results = dto.sizes.map(size => {

      let chestDiff = size.chest - userChest;
      let waistDiff = size.waist - userWaist;

      // 🔥 IMPORTANT: per-size fitType (fallback to dto.fitType)
      const fitType = size.fitType?? dto.fitType?? 'regular';

      if (fitType === 'slim') chestDiff -= 2;
      if (fitType === 'oversized') chestDiff += 2;

      // 🔥 classify
      const chestFit =
        chestDiff < 2? 'tight' :
        chestDiff > 6? 'loose' : 'good';

      const waistFit =
        waistDiff < 1? 'tight' :
        waistDiff > 5? 'loose' : 'good';

      // 🔥 score
      let score = 0;

      if (chestFit === 'good') score += 2;
      if (chestFit === 'tight') score -= 1;

      if (waistFit === 'good') score += 2;
      if (waistFit === 'tight') score -= 1;

      return {
        label: size.label,
        score,
        chestFit,
        waistFit,
        chestDiff,
        waistDiff
      };
    });

    // 🔥 sort best
    results.sort((a, b) => b.score - a.score);

    const best = results[0];
    const second = results[1];

    // 🔥 confidence
    let confidence: 'high' | 'medium' | 'low' = 'low';

    if (Math.abs(best.chestDiff) <= 4 && Math.abs(best.waistDiff) <= 4) {
      confidence = 'high';
    } else if (Math.abs(best.chestDiff) <= 6) {
      confidence = 'medium';
    }

    return {
      recommendedSize: best.label,
      alternatives: second? [second.label] : [],
      confidence,
      fitDetails: {
        chest: best.chestFit,
        waist: best.waistFit
      },
      explanation: `Best size is ${best.label}. Chest is ${best.chestFit}, waist is ${best.waistFit}.`
    };
  }
}