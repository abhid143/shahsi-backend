import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import { CreateProductDto } from './application/dto/create-product.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { TypesenseService } from '../search/infrastructure/typesense.service';
import { EmbeddingService } from '../ai/embedding.service';
import { FitEngineService } from '../fit-engine/fit-engine.service';

@Injectable()
export class CatalogService {
  constructor(
    private prisma: PrismaService,
    private typesense: TypesenseService,
    private embeddingService: EmbeddingService,
    private fitEngine: FitEngineService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 🔥 CREATE PRODUCT (FIXED)
  async createProduct(dto: CreateProductDto) {
    let embedding: number[] = [];

    try {
      const text = `${dto.title} ${dto.description}`;
      embedding = await this.embeddingService.generateEmbedding(text);
    } catch (e) {
      console.log('Embedding failed, fallback empty');
    }

    const product = await this.prisma.product.create({
      data: {
        title: dto.title,
        description: dto.description,
        slug: dto.slug,

        category: dto.category,
        brand: dto.brand,
        color: dto.color,
        fabric: dto.fabric,
        occasion: dto.occasion,

        composition: dto.composition,
        style: dto.style,
        print: dto.print,
        badge: dto.badge,

        primaryCollection: dto.primaryCollection,
        secondaryCollection: dto.secondaryCollection,

        basePrice: dto.basePrice,
        currency: dto.currency,

        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,

        embedding,

        // 🔥 RELATIONS
        images: {
          create: dto.images,
        },

        // ✅ FIXED HERE
        variants: {
          create: dto.variants.map((v) => ({
            ...v,
            chest: v.chest ?? 0,
            waist: v.waist ?? 0,
            length: v.length ?? 0,
            fitType: v.fitType ?? 'regular',
          })),
        },
      },
      include: {
        variants: true,
        images: true,
      },
    });

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

  // 🔥 GET ALL
  async getAllProducts() {
    const cacheKey = 'all_products';

    const cached = await this.cacheManager.get<string>(cacheKey);

    if (cached) {
      console.log('⚡ CACHE HIT');
      return JSON.parse(cached);
    }

    const products = await this.prisma.product.findMany({
      include: { variants: true, images: true },
      orderBy: { createdAt: 'desc' },
    });

    await this.cacheManager.set(cacheKey, JSON.stringify(products), 60000);

    return products;
  }

  // 🔥 GET BY ID
  async getProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { variants: true, images: true },
    });
  }

  // 🔥 FILTER
  async filterProducts(query: any) {
    const filters: any = {};

    if (query.category) {
      filters.category = { contains: query.category, mode: 'insensitive' };
    }

    if (query.color) {
      filters.color = { contains: query.color, mode: 'insensitive' };
    }

    if (query.brand) {
      filters.brand = { contains: query.brand, mode: 'insensitive' };
    }

    const products = await this.prisma.product.findMany({
      where: filters,
      include: { variants: true, images: true },
    });

    return {
      count: products.length,
      data: products,
    };
  }

  // 🔥 UPDATE PRODUCT
  async updateProduct(id: string, dto: any) {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
      },
    });

    await this.cacheManager.del('all_products');

    return product;
  }

  // 🔥 DELETE PRODUCT
  async deleteProduct(id: string) {
    await this.prisma.product.delete({
      where: { id },
    });

    await this.cacheManager.del('all_products');

    return { message: 'Deleted successfully' };
  }

    // 🔥 FIT + CATALOG CONNECT (MAIN LOGIC)
  async getProductFit(productId: string, body: any) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (!product.variants.length) {
      throw new Error('No variants available');
    }

    // 🔥 DB → FitEngine format
    const sizes = product.variants.map((v) => ({
      label: v.size,
      chest: v.chest,
      waist: v.waist,
    }));

    // 🔥 CALL FIT ENGINE
    const result = this.fitEngine.calculateFit({
      ...body,
      fitType: product.variants[0]?.fitType || 'regular',
      sizes,
    });

    return {
      productId,
      ...result,
    };
  }
}