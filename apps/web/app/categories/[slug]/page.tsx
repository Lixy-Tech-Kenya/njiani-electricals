import { notFound } from 'next/navigation';
import { api } from '@/lib/api/client';
import { ProductCard } from '@/components/ProductCard';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const category = await api.categories.bySlug(params.slug);
    return { title: category.name };
  } catch {
    return { title: 'Category' };
  }
}

export default async function CategoryPage({ params }: Props) {
  let category;
  try {
    category = await api.categories.bySlug(params.slug);
  } catch {
    notFound();
  }

  const products = await api.products
    .list({ category: params.slug, limit: 24 })
    .catch(() => ({ data: [] }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-bold text-[var(--color-primary)] mb-2">
        {category.name}
      </h1>
      {category.description && (
        <p className="text-[var(--color-muted)] mb-8">{category.description}</p>
      )}

      {products.data.length === 0 ? (
        <p className="text-[var(--color-muted)] py-20 text-center">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.data.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
