import { IsString, IsNumber, IsUUID, IsEnum, IsBoolean, IsArray, IsOptional, Min, Max, MinLength, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../types/product';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(2)
  sku!: string;

  @IsString()
  @MinLength(2)
  slug!: string;

  @IsUUID()
  categoryId!: string;

  @IsNumber()
  @Min(0)
  price!: number; // stored in KES (Kenya Shilling), integer cents

  @IsString()
  @MinLength(10)
  description!: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  imageUrls!: string[];

  @IsEnum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'])
  @IsOptional()
  status?: ProductStatus = 'ACTIVE';

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean = false;

  // Inventory
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockQuantity?: number = 0;

  @IsNumber()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number = 5;

  // SEO Metadata
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];
}

export class UpdateProductDto extends CreateProductDto {
  // All fields are optional in update, handled by PartialType in NestJS,
  // but for shared usage, we might want to repeat or use a base.
  // Actually, in shared we can just export the classes.
}

export class ProductQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'])
  status?: ProductStatus;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  featured?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sort?: string;
}
