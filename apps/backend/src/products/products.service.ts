import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, ProductQueryDto } from '@njiani/shared';
import { ProductEntity } from '../common/entities';
import slugify from 'slugify';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
    try {
      const slug = createProductDto.slug || slugify(createProductDto.name, { lower: true });
      const product = await this.prisma.product.create({
        data: {
          name: createProductDto.name,
          sku: createProductDto.sku,
          slug,
          categoryId: createProductDto.categoryId,
          price: createProductDto.price,
          description: createProductDto.description,
          imageUrls: createProductDto.imageUrls,
          status: createProductDto.status || 'ACTIVE',
          isFeatured: createProductDto.isFeatured || false,
          stockQuantity: createProductDto.stockQuantity || 0,
          lowStockThreshold: createProductDto.lowStockThreshold || 5,
          metaTitle: createProductDto.metaTitle,
          metaDescription: createProductDto.metaDescription,
          keywords: createProductDto.keywords || [],
        },
      });
      
      const entity = new ProductEntity(product);
      await this.cacheManager.set(`product:${product.id}`, entity, 3600000);
      return entity;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Product with this SKU or Slug already exists');
        }
      }
      throw new BadRequestException('Failed to create product');
    }
  }

  async findAll(query: ProductQueryDto) {
    const { category, search, status, featured, page = 1, limit = 20, sort } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(category ? { category: { slug: category } } : {}),
      ...(status ? { status } : { status: 'ACTIVE' }),
      ...(featured !== undefined ? { isFeatured: featured } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      } : {}),
    };

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort) {
      switch (sort) {
        case 'price_asc': orderBy = { price: 'asc' }; break;
        case 'price_desc': orderBy = { price: 'desc' }; break;
        case 'name_asc': orderBy = { name: 'asc' }; break;
        case 'newest': orderBy = { createdAt: 'desc' }; break;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    const entities = data.map((p) => new ProductEntity(p));
    
    // Cache individual products for later retrieval (e.g. cart enrichment)
    await Promise.all(
      entities.map((p) => this.cacheManager.set(`product:${p.id}`, p, 3600000))
    );

    return {
      data: entities,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findFeatured(): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany({
      where: { isFeatured: true, status: 'ACTIVE' },
      take: 8,
      include: { category: true },
    });
    return products.map((p) => new ProductEntity(p));
  }

  async findOne(slug: string): Promise<ProductEntity> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return new ProductEntity(product);
  }

  async update(id: string, updateProductDto: Partial<CreateProductDto>): Promise<ProductEntity> {
    try {
      const slug = updateProductDto.name && !updateProductDto.slug 
        ? slugify(updateProductDto.name, { lower: true }) 
        : updateProductDto.slug;

      const product = await this.prisma.product.update({
        where: { id },
        data: {
          ...updateProductDto,
          ...(slug ? { slug } : {}),
        },
      });
      return new ProductEntity(product);
    } catch (error) {
      throw new BadRequestException('Failed to update product');
    }
  }

  async remove(id: string): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }
}
