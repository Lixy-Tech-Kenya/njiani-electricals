import { Expose, Type } from 'class-transformer';
import { ProductStatus, Role, OrderChannel, OrderStatus } from '@njiani/shared';

export class UserEntity {
  @Expose() id!: string;
  @Expose() email!: string;
  @Expose() name!: string;
  @Expose() role!: Role;
  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}

export class CategoryEntity {
  @Expose() id!: string;
  @Expose() name!: string;
  @Expose() slug!: string;
  @Expose() description?: string | null;
  @Expose() imageUrl?: string | null;
  @Expose() sortOrder!: number;
  
  @Expose() metaTitle?: string | null;
  @Expose() metaDescription?: string | null;
  @Expose() keywords?: string[];

  @Expose()
  @Type(() => ProductEntity)
  products?: ProductEntity[];

  constructor(partial: Partial<CategoryEntity>) {
    Object.assign(this, partial);
  }
}

export class ProductEntity {
  @Expose() id!: string;
  @Expose() name!: string;
  @Expose() sku!: string;
  @Expose() slug!: string;
  @Expose() categoryId!: string;
  
  @Expose()
  @Type(() => CategoryEntity)
  category?: CategoryEntity;
  
  @Expose() price!: number;
  @Expose() description!: string;
  @Expose() imageUrls!: string[];
  @Expose() status!: ProductStatus;
  @Expose() isFeatured!: boolean;
  
  @Expose() stockQuantity!: number;
  @Expose() lowStockThreshold!: number;
  
  @Expose() metaTitle?: string | null;
  @Expose() metaDescription?: string | null;
  @Expose() keywords?: string[];

  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;

  constructor(partial: Partial<ProductEntity>) {
    Object.assign(this, partial);
  }
}

export class OrderItemEntity {
  @Expose() id!: string;
  @Expose() productId!: string;
  @Expose() productName!: string;
  @Expose() sku!: string;
  @Expose() quantity!: number;
  @Expose() unitPrice!: number;

  constructor(partial: Partial<OrderItemEntity>) {
    Object.assign(this, partial);
  }
}

export class OrderEntity {
  @Expose() id!: string;
  @Expose() referenceNumber!: string;
  @Expose() customerName!: string;
  @Expose() customerPhone!: string;
  @Expose() customerEmail?: string | null;
  @Expose() customerLocation?: string | null;
  @Expose() notes?: string | null;
  @Expose() channel!: OrderChannel;
  @Expose() status!: OrderStatus;
  @Expose() totalAmount!: number;

  @Expose()
  @Type(() => OrderItemEntity)
  items?: OrderItemEntity[];

  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;

  constructor(partial: Partial<OrderEntity>) {
    Object.assign(this, partial);
  }
}
