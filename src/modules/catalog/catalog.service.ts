import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import {
  CreateProductDto,
  ProductMode,
  ProductProductionType,
  VariantProductionType,
} from './application/dto/create-product.dto';
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

  async createProduct(dto: CreateProductDto) {
    let embedding: number[] = [];

    try {
      const text = `${dto.title} ${dto.description ?? ''}`;
      embedding = await this.embeddingService.generateEmbedding(text);
    } catch (e) {
      console.log('Embedding failed, fallback empty');
    }

    const product = await this.prisma.product.create({
      data: {
        title: dto.title,
        description: dto.description,
        slug: dto.slug,
        mode: dto.mode ?? ProductMode.RETAIL,

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
        currency: dto.currency ?? 'USD',

        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,

        embedding,

        // PRODUCT LEVEL MADE-TO-ORDER CONFIG
        productionType: dto.productionType ?? ProductProductionType.READY_STOCK,

        isMadeToOrder:
          dto.isMadeToOrder !== undefined
            ? dto.isMadeToOrder
            : dto.mode === ProductMode.MADE_TO_ORDER,

        allowCustomSizing: dto.allowCustomSizing ?? false,
        allowRushProduction: dto.allowRushProduction ?? false,
        standardLeadTimeDays: dto.standardLeadTimeDays ?? 21,
        rushLeadTimeDays: dto.rushLeadTimeDays ?? null,
        rushFee: dto.rushFee ?? null,
        customSizingFinalSale: dto.customSizingFinalSale ?? false,

        images: {
          create: (dto.images ?? []).map((image) => ({
            url: image.url,
            alt: image.alt,
            isPrimary: image.isPrimary ?? false,
          })),
        },

        variants: {
          create: (dto.variants ?? []).map((variant) => ({
            size: variant.size,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            stock: variant.stock,
            sku: variant.sku,
            barcode: variant.barcode,
            weight: variant.weight,
            weightUnit: variant.weightUnit,

            chest: variant.chest ?? 0,
            waist: variant.waist ?? 0,
            length: variant.length ?? 0,
            fitType: variant.fitType ?? 'regular',

            // VARIANT LEVEL SHIPS NOW / PRODUCTION CONFIG
            isShipsNow: variant.isShipsNow ?? false,
            productionType:
              variant.productionType ?? VariantProductionType.READY_STOCK,
          })),
        },
      },
      include: {
        variants: true,
        images: true,
      },
    });

    try {
      await this.typesense.indexProduct({
        id: product.id,
        title: product.title,
        category: product.category,
        color: product.color,
        brand: product.brand,
      });
    } catch (e) {
      console.log('Typesense indexing failed');
    }

    await this.cacheManager.del('all_products');

    return product;
  }

  async getAllProducts() {
    const cacheKey = 'all_products';

    const cached = await this.cacheManager.get<string>(cacheKey);

    if (cached) {
      console.log('CACHE HIT');
      return JSON.parse(cached);
    }

    const products = await this.prisma.product.findMany({
      include: {
        variants: true,
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    await this.cacheManager.set(cacheKey, JSON.stringify(products), 60000);

    return products;
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

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

    if (query.brand) {
      filters.brand = {
        contains: query.brand,
        mode: 'insensitive',
      };
    }

    if (query.fabric) {
      filters.fabric = {
        contains: query.fabric,
        mode: 'insensitive',
      };
    }

    if (query.occasion) {
      filters.occasion = {
        contains: query.occasion,
        mode: 'insensitive',
      };
    }

    if (query.mode) {
      filters.mode = query.mode;
    }

    if (query.productionType) {
      filters.productionType = query.productionType;
    }

    if (query.isMadeToOrder !== undefined) {
      filters.isMadeToOrder =
        query.isMadeToOrder === true || query.isMadeToOrder === 'true';
    }

    if (query.allowCustomSizing !== undefined) {
      filters.allowCustomSizing =
        query.allowCustomSizing === true || query.allowCustomSizing === 'true';
    }

    if (query.allowRushProduction !== undefined) {
      filters.allowRushProduction =
        query.allowRushProduction === true ||
        query.allowRushProduction === 'true';
    }

    if (query.isShipsNow !== undefined) {
      filters.variants = {
        some: {
          isShipsNow: query.isShipsNow === true || query.isShipsNow === 'true',
        },
      };
    }

    const products = await this.prisma.product.findMany({
      where: filters,
      include: {
        variants: true,
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      count: products.length,
      data: products,
    };
  }

  async updateProduct(id: string, dto: Partial<CreateProductDto>) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        images: true,
      },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        title: dto.title ?? existingProduct.title,
        description:
          dto.description !== undefined
            ? dto.description
            : existingProduct.description,
        slug: dto.slug ?? existingProduct.slug,
        mode: dto.mode ?? existingProduct.mode,

        category:
          dto.category !== undefined ? dto.category : existingProduct.category,
        brand: dto.brand !== undefined ? dto.brand : existingProduct.brand,
        color: dto.color !== undefined ? dto.color : existingProduct.color,
        fabric: dto.fabric !== undefined ? dto.fabric : existingProduct.fabric,
        occasion:
          dto.occasion !== undefined ? dto.occasion : existingProduct.occasion,

        composition:
          dto.composition !== undefined
            ? dto.composition
            : existingProduct.composition,
        style: dto.style !== undefined ? dto.style : existingProduct.style,
        print: dto.print !== undefined ? dto.print : existingProduct.print,
        badge: dto.badge !== undefined ? dto.badge : existingProduct.badge,

        primaryCollection:
          dto.primaryCollection !== undefined
            ? dto.primaryCollection
            : existingProduct.primaryCollection,
        secondaryCollection:
          dto.secondaryCollection !== undefined
            ? dto.secondaryCollection
            : existingProduct.secondaryCollection,

        basePrice:
          dto.basePrice !== undefined
            ? dto.basePrice
            : existingProduct.basePrice,
        currency: dto.currency ?? existingProduct.currency,

        seoTitle:
          dto.seoTitle !== undefined ? dto.seoTitle : existingProduct.seoTitle,
        seoDescription:
          dto.seoDescription !== undefined
            ? dto.seoDescription
            : existingProduct.seoDescription,

        productionType:
          dto.productionType ?? existingProduct.productionType,
        isMadeToOrder:
          dto.isMadeToOrder ?? existingProduct.isMadeToOrder,
        allowCustomSizing:
          dto.allowCustomSizing ?? existingProduct.allowCustomSizing,
        allowRushProduction:
          dto.allowRushProduction ?? existingProduct.allowRushProduction,
        standardLeadTimeDays:
          dto.standardLeadTimeDays ?? existingProduct.standardLeadTimeDays,
        rushLeadTimeDays:
          dto.rushLeadTimeDays !== undefined
            ? dto.rushLeadTimeDays
            : existingProduct.rushLeadTimeDays,
        rushFee:
          dto.rushFee !== undefined ? dto.rushFee : existingProduct.rushFee,
        customSizingFinalSale:
          dto.customSizingFinalSale ??
          existingProduct.customSizingFinalSale,

        ...(dto.images
          ? {
              images: {
                deleteMany: {},
                create: dto.images.map((image) => ({
                  url: image.url,
                  alt: image.alt,
                  isPrimary: image.isPrimary ?? false,
                })),
              },
            }
          : {}),

        ...(dto.variants
          ? {
              variants: {
                deleteMany: {},
                create: dto.variants.map((variant) => ({
                  size: variant.size,
                  price: variant.price,
                  compareAtPrice: variant.compareAtPrice,
                  stock: variant.stock,
                  sku: variant.sku,
                  barcode: variant.barcode,
                  weight: variant.weight,
                  weightUnit: variant.weightUnit,

                  chest: variant.chest ?? 0,
                  waist: variant.waist ?? 0,
                  length: variant.length ?? 0,
                  fitType: variant.fitType ?? 'regular',

                  isShipsNow: variant.isShipsNow ?? false,
                  productionType:
                    variant.productionType ??
                    VariantProductionType.READY_STOCK,
                })),
              },
            }
          : {}),
      },
      include: {
        variants: true,
        images: true,
      },
    });

    try {
      await this.typesense.indexProduct({
        id: product.id,
        title: product.title,
        category: product.category,
        color: product.color,
        brand: product.brand,
      });
    } catch (e) {
      console.log('Typesense re-indexing failed');
    }

    await this.cacheManager.del('all_products');

    return product;
  }

  async deleteProduct(id: string) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    await this.cacheManager.del('all_products');

    return {
      message: 'Deleted successfully',
    };
  }

  async getProductFit(productId: string, body: any) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        variants: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.variants.length) {
      throw new BadRequestException('No variants available');
    }

    const sizes = product.variants.map((variant) => ({
      label: variant.size,
      chest: variant.chest,
      waist: variant.waist,
    }));

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

  async estimateProductArrival(
    productId: string,
    options?: {
      variantId?: string;
      sizeType?: 'STANDARD' | 'CUSTOM';
      deliveryOption?: 'STANDARD' | 'RUSH';
    },
  ) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        variants: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const sizeType = options?.sizeType ?? 'STANDARD';
    const deliveryOption = options?.deliveryOption ?? 'STANDARD';

    if (sizeType === 'CUSTOM' && !product.allowCustomSizing) {
      throw new BadRequestException(
        'Custom sizing is not available for this product',
      );
    }

    if (deliveryOption === 'RUSH' && !product.allowRushProduction) {
      throw new BadRequestException(
        'Rush production is not available for this product',
      );
    }

    const variant = options?.variantId
      ? product.variants.find((item) => item.id === options.variantId)
      : null;

    const isShipsNow = variant?.isShipsNow === true && sizeType !== 'CUSTOM';

    const productionType = isShipsNow
      ? VariantProductionType.READY_STOCK
      : product.isMadeToOrder || sizeType === 'CUSTOM'
        ? VariantProductionType.MADE_TO_ORDER
        : product.productionType;

    const leadDays = isShipsNow
      ? 7
      : deliveryOption === 'RUSH' && product.rushLeadTimeDays
        ? product.rushLeadTimeDays
        : product.standardLeadTimeDays;

    const estimatedArrivalStart = new Date();
    estimatedArrivalStart.setDate(estimatedArrivalStart.getDate() + leadDays);

    const estimatedArrivalEnd = new Date(estimatedArrivalStart);
    estimatedArrivalEnd.setDate(estimatedArrivalStart.getDate() + 6);

    return {
      productId,
      variantId: options?.variantId,
      sizeType,
      deliveryOption,
      productionType,
      isShipsNow,
      estimatedArrivalStart,
      estimatedArrivalEnd,
      rushFee:
        deliveryOption === 'RUSH' && product.rushFee ? product.rushFee : 0,
      customSizingFinalSale:
        sizeType === 'CUSTOM' ? product.customSizingFinalSale : false,
      message: isShipsNow
        ? 'Ships Now item. Ready-stock delivery estimate.'
        : 'Made-to-order item. Production starts after purchase.',
    };
  }
}