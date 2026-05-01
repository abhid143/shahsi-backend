import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CreateProductDto } from './application/dto/create-product.dto';
import { ApiResponse } from '../../shared/utils/api-response';

// 🔥 ADD THIS IMPORT
import { FitRequestDto } from '../fit-engine/dto/fit-request.dto';

@Controller('catalog')
export class CatalogController {
  constructor(private catalog: CatalogService) {}

  @Post()
  async create(@Body() body: CreateProductDto) {
    const data = await this.catalog.createProduct(body);
    return ApiResponse.success(data);
  }

  @Get()
  async findAll() {
    const data = await this.catalog.getAllProducts();
    return ApiResponse.success(data);
  }

  @Get('filter')
  async filter(@Query() query: any) {
    const data = await this.catalog.filterProducts(query);
    return ApiResponse.success(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.catalog.getProductById(id);
    return ApiResponse.success(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.catalog.updateProduct(id, body);
    return ApiResponse.success(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.catalog.deleteProduct(id);
    return ApiResponse.success(data);
  }

  // 🔥 NEW: FIT RECOMMENDATION API (NO CHANGE IN EXISTING APIs)
  @Post(':id/fit')
  async getFit(
    @Param('id') productId: string,
    @Body() body: Omit<FitRequestDto, 'sizes'>,
  ) {
    const data = await this.catalog.getProductFit(productId, body);
    return ApiResponse.success(data);
  }
}