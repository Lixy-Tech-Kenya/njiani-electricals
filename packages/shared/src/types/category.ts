import { Product } from './product';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  
  // SEO Metadata
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];

  products?: Product[];
}
