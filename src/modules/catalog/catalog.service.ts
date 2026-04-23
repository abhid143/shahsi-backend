import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { CreateProductDto } from './application/dto/create-product.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { TypesenseService } from '../search/infrastructure/typesense.service';
import { EmbeddingService } from '../ai/embedding.service'; 

@Injectable()
export class CatalogService {
  constructor(
    private prisma: PrismaService,
    private typesense: TypesenseService,
    private embeddingService: EmbeddingService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 🔥 CREATE PRODUCT + INDEX + EMBEDDING (SAFE)
  async createProduct(dto: CreateProductDto) {
    // ✅ safe embedding (no crash)
    let embedding: number[] = [];

    try {
      const text = `${dto.title} ${dto.description}`;
      embedding = await this.embeddingService.generateEmbedding(text);
    } catch (e) {
      console.log('Embedding failed, fallback empty');
    }

    const product = await this.prisma.product.create({
      data: {
        ...dto,
        embedding, // ✅ safe
        variants: {
          create: dto.variants,
        },
      },
      include: {
        variants: true,
      },
    });

    // 🔥 index in Typesense
    await this.typesense.indexProduct({
      id: product.id,
      title: product.title,
      category: product.category,
      color: product.color,
      brand: product.brand,
    });

    // 🔥 clear cache
    await this.cacheManager.del('all_products');

    return product;
  }

  // 🔥 GET ALL (WITH CACHE)
  async getAllProducts() {
    const cacheKey = 'all_products';

    const cached = await this.cacheManager.get<string>(cacheKey);

    if (cached) {
      console.log('⚡ CACHE HIT');
      return JSON.parse(cached);
    }

    console.log('❌ CACHE MISS → DB CALL');

    const products = await this.prisma.product.findMany({
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    });

    await this.cacheManager.set(cacheKey, JSON.stringify(products), 60000);

    return products;
  }

  // 🔥 GET BY ID
  async getProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
  }

  // 🔥 FILTER SYSTEM (FIXED + FLEXIBLE)
  async filterProducts(query: any) {
    const filters: any = {};

    if (query.category) {
      filters.category = {
        contains: query.category,
        mode: 'insensitive',
      };
    }

    if (query.color) {
      filters.color = {
        contains: query.color,
        mode: 'insensitive',
      };
    }

    if (query.occasion) {
      filters.occasion = {
        contains: query.occasion,
        mode: 'insensitive',
      };
    }

    if (query.brand) {
      filters.brand = {
        contains: query.brand,
        mode: 'insensitive',
      };
    }

    const products = await this.prisma.product.findMany({
      where: filters,
      include: { variants: true },
    });

    return {
      count: products.length,
      data: products,
    };
  }

  // 🔥 UPDATE PRODUCT + RE-INDEX
  async updateProduct(id: string, dto: any) {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        brand: dto.brand,
        color: dto.color,
        fabric: dto.fabric,
        occasion: dto.occasion,
      },
    });

    // 🔥 re-index in Typesense
    await this.typesense.indexProduct({
      id: product.id,
      title: product.title,
      category: product.category,
      color: product.color,
      brand: product.brand,
    });

    await this.cacheManager.del('all_products');

    return product;
  }

  // 🔥 DELETE PRODUCT + REMOVE FROM SEARCH
  async deleteProduct(id: string) {
    await this.prisma.productVariant.deleteMany({
      where: { productId: id },
    });

    const product = await this.prisma.product.delete({
      where: { id },
    });

    // 🔥 delete from Typesense
    try {
      await this.typesense.client
        .collections('products')
        .documents(id)
        .delete();
    } catch (e) {
      console.log('Typesense delete error (safe to ignore)');
    }

    await this.cacheManager.del('all_products');

    return product;
  }
}