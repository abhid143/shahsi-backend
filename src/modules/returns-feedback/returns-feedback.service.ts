import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class ReturnsFeedbackService {
  constructor(private prisma: PrismaService) {}

  // 🔥 store feedback
  async createFeedback(dto: CreateFeedbackDto) {
    return this.prisma.fitFeedback.create({
      data: {
        userId: dto.userId,
        productId: dto.productId,
        size: dto.size,
        result: dto.result,
        issueArea: dto.issueArea,
      },
    });
  }

  // 🔥 learning insights (important)
  async getProductInsights(productId: string) {
    const feedbacks = await this.prisma.fitFeedback.findMany({
      where: { productId },
    });

    if (!feedbacks.length) {
      return {
        message: 'No feedback yet',
      };
    }

    let tooSmall = 0;
    let perfect = 0;
    let tooLarge = 0;

    const issueMap: Record<string, number> = {};

    for (const f of feedbacks) {
      if (f.result === 'too_small') tooSmall++;
      if (f.result === 'perfect') perfect++;
      if (f.result === 'too_large') tooLarge++;

      if (f.issueArea) {
        issueMap[f.issueArea] = (issueMap[f.issueArea] || 0) + 1;
      }
    }

    const total = feedbacks.length;

    return {
      total,
      distribution: {
        too_small: tooSmall,
        perfect,
        too_large: tooLarge,
      },
      percentages: {
        too_small: (tooSmall / total) * 100,
        perfect: (perfect / total) * 100,
        too_large: (tooLarge / total) * 100,
      },
      commonIssues: issueMap,
    };
  }
}