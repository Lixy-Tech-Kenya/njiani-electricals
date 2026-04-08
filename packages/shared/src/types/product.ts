import { Category } from './category';

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

export interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  categoryId: string;
  category?: Category;
  price: number;          // stored in KES (Kenya Shilling), integer cents
  description: string;
  imageUrls: string[];
  status: ProductStatus;
  isFeatured: boolean;
  
  // Inventory
  stockQuantity: number;
  lowStockThreshold: number;
  
  // SEO Metadata
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  
  createdAt: string;      // ISO date string
  updatedAt: string;
}
