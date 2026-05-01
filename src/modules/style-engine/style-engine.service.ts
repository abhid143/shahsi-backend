import { Injectable } from '@nestjs/common';
import { StyleRequestDto } from './dto/style-request.dto';

@Injectable()
export class StyleEngineService {

  // 🔥 simple skin tone color map
  private skinToneMap: Record<string, string[]> = {
    fair: ['pastel', 'soft pink', 'sky blue'],
    medium: ['olive', 'coral', 'navy'],
    dark: ['mustard', 'maroon', 'emerald'],
  };

  analyzeStyle(dto: StyleRequestDto) {

    let score = 0;
    let colorMatch: 'low' | 'high' = 'low';
    let reason = 'No strong match';

    const color = dto.color?.toLowerCase(); // ✅ safe optional chaining

    // 🔥 Skin tone match
    if (dto.skinTone && color) {
      const allowedColors = this.skinToneMap[dto.skinTone] || [];

      if (allowedColors.includes(color)) {
        score += 2;
        colorMatch = 'high';
        reason = `This color suits ${dto.skinTone} skin tone`;
      } else {
        reason = `This color may not strongly match your skin tone`;
      }
    }

    // 🔥 User color preference
    if (color && dto.preferredColors?.some(c => c.toLowerCase() === color)) {
      score += 2;
      colorMatch = 'high';
      reason = 'Matches your preferred color';
    }

    // 🔥 Modesty preference (simple logic)
    if (dto.modestyPreference === 'modest' && dto.category === 'short') {
      score -= 1;
    }

    return {
      styleScore: score,
      style: {
        color_match: colorMatch,
        reason,
      },
    };
  }
}