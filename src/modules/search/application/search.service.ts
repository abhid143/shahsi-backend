import { Injectable } from '@nestjs/common';
import { TypesenseService } from '../infrastructure/typesense.service';
import { EmbeddingService } from '../../ai/embedding.service'; 
import { PrismaService } from '../../../infra/database/prisma.service'; 

@Injectable()
export class SearchService {
  constructor(
    private typesense: TypesenseService,
    private embeddingService: EmbeddingService, 
    private prisma: PrismaService, 
  ) {}

  // 🔥 keyword search
  async keywordSearch(query: string) {
    try {
      const result = await this.typesense.search(query);

      return result.hits?.map((h: any) => h.document) || [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('❌ TYPESENSE ERROR:', errorMessage);
      throw error;
    }
  }

  // 🔥 semantic search (placeholder for now)
  async semanticSearch(query: string) {
  try {
    const queryEmbedding =
      await this.embeddingService.generateEmbedding(query);

    const products = await this.prisma.product.findMany();

    function cosineSimilarity(a: number[], b: number[]) {
      if (!a || !b) return 0;

      const dot = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
      const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
      const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));

      if (magA === 0 || magB === 0) return 0;

      return dot / (magA * magB);
    }

    const scored = products.map((p) => ({
      ...p,
      score: cosineSimilarity(queryEmbedding, p.embedding),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch (error) {
    console.error('Semantic search error:', error);
    return [];
  }
}

  // 🔥 hybrid search
  async hybridSearch(query: string) {
  try {
    const keyword = await this.keywordSearch(query);
    const semantic = await this.semanticSearch(query);

    const map = new Map();

    keyword.forEach((p) => map.set(p.id, { ...p, score: 1 }));

    semantic.forEach((p) => {
      if (map.has(p.id)) {
        map.get(p.id).score += p.score || 0;
      } else {
        map.set(p.id, p);
      }
    });

    return Array.from(map.values()).sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Hybrid search error:', error);
    return [];
  }
}
}