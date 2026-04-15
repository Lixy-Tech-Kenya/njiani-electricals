import { serverApi } from '@/lib/api/server';
import { ProductForm } from '../_components/ProductForm';
import { notFound } from 'next/navigation';
import type { Product } from '@njiani/shared';

export const metadata = { title: 'Edit Product — Njiani Admin' };

interface Props {
  params: { slug: string };
}

export default async function EditProductPage({ params }: Props) {
  let product: Product | null = null;

  try {
    product = await serverApi.get<Product>(`/products/${params.slug}`);
  } catch {
    notFound();
  }

  if (!product) notFound();

  return <ProductForm product={product} />;
}
