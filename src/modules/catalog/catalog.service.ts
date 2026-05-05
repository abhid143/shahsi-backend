import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma.service';
import {
  AvailabilityStatus,
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

  private readonly productInclude = {
    variants: true,
    images: {
      orderBy: {
        position: 'asc' as const,
      },
    },
    colors: {
      orderBy: {
        position: 'asc' as const,
      },
    },
    reviews: {
      orderBy: {
        createdAt: 'desc' as const,
      },
    },
    relatedProducts: {
      orderBy: {
        position: 'asc' as const,
      },
      include: {
        relatedProduct: {
          include: {
            images: {
              orderBy: {
                position: 'asc' as const,
              },
            },
            variants: true,
          },
        },
      },
    },
  };

  private handlePrismaError(error: any): never {
    console.error('CATALOG PRISMA ERROR:', error);

    if (error?.code === 'P2002') {
      const target = Array.isArray(error?.meta?.target)
        ? error.meta.target.join(', ')
        : 'unique field';

      throw new BadRequestException(`Duplicate value for ${target}`);
    }

    if (error?.code === 'P2022') {
      throw new InternalServerErrorException(
        `Database column missing: ${error?.meta?.column ?? 'unknown column'}`,
      );
    }

    if (error?.code === 'P2003') {
      throw new BadRequestException(
        'Invalid related product id or relation reference',
      );
    }

    throw new InternalServerErrorException('Catalog database operation failed');
  }

  private async clearProductsCache() {
    try {
      await this.cacheManager.del('all_products');
    } catch (error) {
      console.error('CACHE DELETE ERROR:', error);
    }
  }

  private async indexProduct(product: any) {
    try {
      await this.typesense.indexProduct({
        id: product.id,
        title: product.title,
        category: product.category,
        color: product.color,
        brand: product.brand,
      });
    } catch (error) {
      console.error('TYPESENSE INDEX ERROR:', error);
    }
  }

  async createProduct(dto: CreateProductDto) {
    let embedding: number[] = [];

    try {
      const text = `${dto.title} ${dto.description ?? ''}`;
      embedding = await this.embeddingService.generateEmbedding(text);
    } catch (error) {
      console.error('EMBEDDING ERROR:', error);
      embedding = [];
    }

    let product: any;

    try {
      product = await this.prisma.product.create({
        data: {
          title: dto.title,
          description: dto.description,
          shortDescription: dto.shortDescription,
          slug: dto.slug,
          mode: dto.mode ?? ProductMode.RETAIL,

          category: dto.category,
          brand: dto.brand,
          vendor: dto.vendor,
          color: dto.color,
          fabric: dto.fabric,
          occasion: dto.occasion,

          composition: dto.composition,
          style: dto.style,
          print: dto.print,
          badge: dto.badge,

          primaryCollection: dto.primaryCollection,
          secondaryCollection: dto.secondaryCollection,

          categories: dto.categories ?? [],
          tags: dto.tags ?? [],
          careInstructions: dto.careInstructions ?? [],

          basePrice: dto.basePrice,
          compareAtPrice: dto.compareAtPrice,
          discountPercent: dto.discountPercent,
          currency: dto.currency ?? 'USD',

          productionType:
            dto.productionType ?? ProductProductionType.READY_STOCK,

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

          availabilityStatus:
            dto.availabilityStatus ?? AvailabilityStatus.IN_STOCK,
          availabilityLabel: dto.availabilityLabel,
          lowStockThreshold: dto.lowStockThreshold ?? 3,

          soldInLastHours: dto.soldInLastHours,
          soldHoursWindow: dto.soldHoursWindow,
          viewingNow: dto.viewingNow,
          rating: dto.rating,
          reviewCount: dto.reviewCount,

          estimatedDomestic: dto.estimatedDomestic,
          estimatedInternational: dto.estimatedInternational,
          pickupAvailable: dto.pickupAvailable ?? false,
          pickupReadyIn: dto.pickupReadyIn,

          returnWindowDays: dto.returnWindowDays,
          returnText: dto.returnText,
          isFinalSale: dto.isFinalSale ?? false,

          storeName: dto.storeName,
          storeLocation: dto.storeLocation,
          storeAddress: dto.storeAddress,
          storePickupAvailable: dto.storePickupAvailable ?? false,

          tabDescription: dto.tabDescription,
          tabCompositionCare: dto.tabCompositionCare,
          tabShippingReturns: dto.tabShippingReturns,
          tabReturnPolicies: dto.tabReturnPolicies,

          reviewsAverage: dto.reviewsAverage,
          reviewsTotal: dto.reviewsTotal,
          review5Count: dto.review5Count ?? 0,
          review4Count: dto.review4Count ?? 0,
          review3Count: dto.review3Count ?? 0,
          review2Count: dto.review2Count ?? 0,
          review1Count: dto.review1Count ?? 0,

          sizeGuideUnit: dto.sizeGuideUnit ?? 'inches',

          paymentMethods: dto.paymentMethods ?? [],

          seoTitle: dto.seoTitle,
          seoDescription: dto.seoDescription,
          printSwatch: dto.printSwatch,

          embedding,

          images: {
            create: (dto.images ?? []).map((image) => ({
              url: image.url,
              alt: image.alt,
              isPrimary: image.isPrimary ?? false,
              position: image.position ?? 0,
              colorName: image.colorName,
            })),
          },

          variants: {
            create: (dto.variants ?? []).map((variant) => ({
              size: variant.size,
              color: variant.color,
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

              isAvailable: variant.isAvailable ?? true,
              isShipsNow: variant.isShipsNow ?? false,
              productionType:
                variant.productionType ?? VariantProductionType.READY_STOCK,
            })),
          },

          ...(dto.colors && dto.colors.length > 0
            ? {
                colors: {
                  create: dto.colors.map((color) => ({
                    name: color.name,
                    hex: color.hex,
                    imageUrl: color.imageUrl,
                    isSelected: color.isSelected ?? false,
                    position: color.position ?? 0,
                  })),
                },
              }
            : {}),

          ...(dto.reviews && dto.reviews.length > 0
            ? {
                reviews: {
                  create: dto.reviews.map((review) => ({
                    title: review.title,
                    rating: review.rating,
                    comment: review.comment,
                    author: review.author,
                    images: review.images ?? [],
                  })),
                },
              }
            : {}),

          ...(dto.relatedProducts && dto.relatedProducts.length > 0
            ? {
                relatedProducts: {
                  create: dto.relatedProducts.map((item) => ({
                    relatedProductId: item.relatedProductId,
                    position: item.position ?? 0,
                  })),
                },
              }
            : {}),
        },
        include: this.productInclude,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }

    await this.indexProduct(product);
    await this.clearProductsCache();

    return product;
  }

  async getAllProducts() {
    const cacheKey = 'all_products';

    let cached: string | undefined;

    try {
      cached = await this.cacheManager.get<string>(cacheKey);
    } catch (error) {
      console.error('CACHE GET ERROR:', error);
    }

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        console.error('CACHE JSON PARSE ERROR:', error);
      }
    }

    let products: any[] = [];

    try {
      products = await this.prisma.product.findMany({
        include: this.productInclude,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }

    try {
      await this.cacheManager.set(cacheKey, JSON.stringify(products), 60000);
    } catch (error) {
      console.error('CACHE SET ERROR:', error);
    }

    return products;
  }

  async getProductById(id: string) {
    let product: any;

    try {
      product = await this.prisma.product.findUnique({
        where: { id },
        include: this.productInclude,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async getProductBySlug(slug: string) {
    let product: any;

    try {
      product = await this.prisma.product.findFirst({
        where: { slug },
        include: this.productInclude,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }

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

    if (query.vendor) {
      filters.vendor = {
        contains: query.vendor,
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

    if (query.availabilityStatus) {
      filters.availabilityStatus = query.availabilityStatus;
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

    let products: any[] = [];

    try {
      products = await this.prisma.product.findMany({
        where: filters,
        include: this.productInclude,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }

    return {
      count: products.length,
      data: products,
    };
  }

  async updateProduct(id: string, dto: Partial<CreateProductDto>) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
      include: this.productInclude,
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    let product: any;

    try {
      product = await this.prisma.product.update({
        where: { id },
        data: {
          title: dto.title ?? existingProduct.title,
          description:
            dto.description !== undefined
              ? dto.description
              : existingProduct.description,
          shortDescription:
            dto.shortDescription !== undefined
              ? dto.shortDescription
              : existingProduct.shortDescription,
          slug: dto.slug ?? existingProduct.slug,
          mode: dto.mode ?? existingProduct.mode,

          category:
            dto.category !== undefined
              ? dto.category
              : existingProduct.category,
          brand: dto.brand !== undefined ? dto.brand : existingProduct.brand,
          vendor:
            dto.vendor !== undefined ? dto.vendor : existingProduct.vendor,
          color: dto.color !== undefined ? dto.color : existingProduct.color,
          fabric:
            dto.fabric !== undefined ? dto.fabric : existingProduct.fabric,
          occasion:
            dto.occasion !== undefined
              ? dto.occasion
              : existingProduct.occasion,

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

          categories: dto.categories ?? existingProduct.categories,
          tags: dto.tags ?? existingProduct.tags,
          careInstructions:
            dto.careInstructions ?? existingProduct.careInstructions,

          basePrice:
            dto.basePrice !== undefined
              ? dto.basePrice
              : existingProduct.basePrice,
          compareAtPrice:
            dto.compareAtPrice !== undefined
              ? dto.compareAtPrice
              : existingProduct.compareAtPrice,
          discountPercent:
            dto.discountPercent !== undefined
              ? dto.discountPercent
              : existingProduct.discountPercent,
          currency: dto.currency ?? existingProduct.currency,

          productionType: dto.productionType ?? existingProduct.productionType,
          isMadeToOrder: dto.isMadeToOrder ?? existingProduct.isMadeToOrder,
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

          availabilityStatus:
            dto.availabilityStatus ?? existingProduct.availabilityStatus,
          availabilityLabel:
            dto.availabilityLabel !== undefined
              ? dto.availabilityLabel
              : existingProduct.availabilityLabel,
          lowStockThreshold:
            dto.lowStockThreshold ?? existingProduct.lowStockThreshold,

          soldInLastHours:
            dto.soldInLastHours !== undefined
              ? dto.soldInLastHours
              : existingProduct.soldInLastHours,
          soldHoursWindow:
            dto.soldHoursWindow !== undefined
              ? dto.soldHoursWindow
              : existingProduct.soldHoursWindow,
          viewingNow:
            dto.viewingNow !== undefined
              ? dto.viewingNow
              : existingProduct.viewingNow,
          rating:
            dto.rating !== undefined ? dto.rating : existingProduct.rating,
          reviewCount:
            dto.reviewCount !== undefined
              ? dto.reviewCount
              : existingProduct.reviewCount,

          estimatedDomestic:
            dto.estimatedDomestic !== undefined
              ? dto.estimatedDomestic
              : existingProduct.estimatedDomestic,
          estimatedInternational:
            dto.estimatedInternational !== undefined
              ? dto.estimatedInternational
              : existingProduct.estimatedInternational,
          pickupAvailable:
            dto.pickupAvailable ?? existingProduct.pickupAvailable,
          pickupReadyIn:
            dto.pickupReadyIn !== undefined
              ? dto.pickupReadyIn
              : existingProduct.pickupReadyIn,

          returnWindowDays:
            dto.returnWindowDays !== undefined
              ? dto.returnWindowDays
              : existingProduct.returnWindowDays,
          returnText:
            dto.returnText !== undefined
              ? dto.returnText
              : existingProduct.returnText,
          isFinalSale: dto.isFinalSale ?? existingProduct.isFinalSale,

          storeName:
            dto.storeName !== undefined
              ? dto.storeName
              : existingProduct.storeName,
          storeLocation:
            dto.storeLocation !== undefined
              ? dto.storeLocation
              : existingProduct.storeLocation,
          storeAddress:
            dto.storeAddress !== undefined
              ? dto.storeAddress
              : existingProduct.storeAddress,
          storePickupAvailable:
            dto.storePickupAvailable ?? existingProduct.storePickupAvailable,

          tabDescription:
            dto.tabDescription !== undefined
              ? dto.tabDescription
              : existingProduct.tabDescription,
          tabCompositionCare:
            dto.tabCompositionCare !== undefined
              ? dto.tabCompositionCare
              : existingProduct.tabCompositionCare,
          tabShippingReturns:
            dto.tabShippingReturns !== undefined
              ? dto.tabShippingReturns
              : existingProduct.tabShippingReturns,
          tabReturnPolicies:
            dto.tabReturnPolicies !== undefined
              ? dto.tabReturnPolicies
              : existingProduct.tabReturnPolicies,

          reviewsAverage:
            dto.reviewsAverage !== undefined
              ? dto.reviewsAverage
              : existingProduct.reviewsAverage,
          reviewsTotal:
            dto.reviewsTotal !== undefined
              ? dto.reviewsTotal
              : existingProduct.reviewsTotal,
          review5Count: dto.review5Count ?? existingProduct.review5Count,
          review4Count: dto.review4Count ?? existingProduct.review4Count,
          review3Count: dto.review3Count ?? existingProduct.review3Count,
          review2Count: dto.review2Count ?? existingProduct.review2Count,
          review1Count: dto.review1Count ?? existingProduct.review1Count,

          sizeGuideUnit: dto.sizeGuideUnit ?? existingProduct.sizeGuideUnit,

          paymentMethods: dto.paymentMethods ?? existingProduct.paymentMethods,

          seoTitle:
            dto.seoTitle !== undefined
              ? dto.seoTitle
              : existingProduct.seoTitle,
          seoDescription:
            dto.seoDescription !== undefined
              ? dto.seoDescription
              : existingProduct.seoDescription,
          printSwatch:
            dto.printSwatch !== undefined
              ? dto.printSwatch
              : existingProduct.printSwatch,

          ...(dto.images
            ? {
                images: {
                  deleteMany: {},
                  create: dto.images.map((image) => ({
                    url: image.url,
                    alt: image.alt,
                    isPrimary: image.isPrimary ?? false,
                    position: image.position ?? 0,
                    colorName: image.colorName,
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
                    color: variant.color,
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

                    isAvailable: variant.isAvailable ?? true,
                    isShipsNow: variant.isShipsNow ?? false,
                    productionType:
                      variant.productionType ??
                      VariantProductionType.READY_STOCK,
                  })),
                },
              }
            : {}),

          ...(dto.colors
            ? {
                colors: {
                  deleteMany: {},
                  create: dto.colors.map((color) => ({
                    name: color.name,
                    hex: color.hex,
                    imageUrl: color.imageUrl,
                    isSelected: color.isSelected ?? false,
                    position: color.position ?? 0,
                  })),
                },
              }
            : {}),

          ...(dto.reviews
            ? {
                reviews: {
                  deleteMany: {},
                  create: dto.reviews.map((review) => ({
                    title: review.title,
                    rating: review.rating,
                    comment: review.comment,
                    author: review.author,
                    images: review.images ?? [],
                  })),
                },
              }
            : {}),

          ...(dto.relatedProducts
            ? {
                relatedProducts: {
                  deleteMany: {},
                  create: dto.relatedProducts.map((item) => ({
                    relatedProductId: item.relatedProductId,
                    position: item.position ?? 0,
                  })),
                },
              }
            : {}),
        },
        include: this.productInclude,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }

    await this.indexProduct(product);
    await this.clearProductsCache();

    return product;
  }

  async deleteProduct(id: string) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    try {
      await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }

    await this.clearProductsCache();

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