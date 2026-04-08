import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from '@njiani/shared';
import { CategoryEntity } from '../common/entities';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    try {
      const slug = createCategoryDto.slug || slugify(createCategoryDto.name, { lower: true });
      const category = await this.prisma.category.create({
        data: {
          name: createCategoryDto.name,
          slug,
          description: createCategoryDto.description,
          imageUrl: createCategoryDto.imageUrl,
          sortOrder: createCategoryDto.sortOrder || 0,
          metaTitle: createCategoryDto.metaTitle,
          metaDescription: createCategoryDto.metaDescription,
          keywords: createCategoryDto.keywords || [],
        },
      });
      return new CategoryEntity(category);
    } catch (error) {
      throw new BadRequestException('Failed to create category');
    }
  }

  async findAll(): Promise<CategoryEntity[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return categories.map((c) => new CategoryEntity(c));
  }

  async findOne(slug: string): Promise<CategoryEntity> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true }
        }
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }

    return new CategoryEntity(category);
  }

  async update(id: string, updateCategoryDto: Partial<CreateCategoryDto>): Promise<CategoryEntity> {
    try {
      const slug = updateCategoryDto.name && !updateCategoryDto.slug 
        ? slugify(updateCategoryDto.name, { lower: true }) 
        : updateCategoryDto.slug;

      const category = await this.prisma.category.update({
        where: { id },
        data: {
          ...updateCategoryDto,
          ...(slug ? { slug } : {}),
        },
      });
      return new CategoryEntity(category);
    } catch (error) {
      throw new BadRequestException('Failed to update category');
    }
  }

  async remove(id: string): Promise<void> {
    const productCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw new BadRequestException('Cannot delete category with associated products');
    }

    await this.prisma.category.delete({
      where: { id },
    });
  }
}
