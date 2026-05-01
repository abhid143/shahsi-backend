export class RecommendationResponseDto {
  recommendedSize!: string;
  confidence!: 'high' | 'medium' | 'low';

  fit!: {
    chest: string;
    waist: string;
  };

  explanation!: {
    summary: string;
    fitSummary: string;
    alternative?: string;
  };
}