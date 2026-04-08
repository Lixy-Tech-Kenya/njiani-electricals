import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ProductsService } from './products.service';
import { CreateProductDto, ProductQueryDto, Role } from '@njiani/shared';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Public } from '../common/decorators';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (Admin)' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List products with filters and pagination' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('featured')
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('featured_products')
  @CacheTTL(3600000) // 1 hour
  @ApiOperation({ summary: 'Get featured products' })
  findFeatured() {
    return this.productsService.findFeatured();
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get product by slug' })
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product (Admin)' })
  update(@Param('id') id: string, @Body() updateProductDto: Partial<CreateProductDto>) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a product (Admin)' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
