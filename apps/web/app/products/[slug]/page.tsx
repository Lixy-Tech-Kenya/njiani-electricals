import { notFound } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api/client';
import { formatPrice } from '@njiani/shared';
import { AddToCartButton } from './_components/AddToCartButton';
import { WhatsAppButton } from './_components/WhatsAppButton';
import { ProductCard } from '@/components/ProductCard';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await api.products.bySlug(params.slug);
    return {
      title: product.name,
      description: product.description.slice(0, 160),
    };
  } catch {
    return { title: 'Product Not Found' };
  }
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500';

export default async function ProductDetailPage({ params }: Props) {
  let product;
  try {
    product = await api.products.bySlug(params.slug);
  } catch {
    notFound();
  }

  // Related products from same category
  const related = await api.products
    .list({ category: product.category?.slug, limit: 4 })
    .catch(() => ({ data: [] }));

  const mainImage =
    product.imageUrls?.[0]
      ? product.imageUrls[0].startsWith('http')
        ? product.imageUrls[0]
        : `${BACKEND_URL}${product.imageUrls[0]}`
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid md:grid-cols-2 gap-10 mb-16">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-6xl">⚡</div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          {product.category && (
            <p className="text-sm text-[var(--color-accent)] font-medium">{product.category.name}</p>
          )}
          <h1 className="font-heading text-3xl font-bold text-[var(--color-primary)]">{product.name}</h1>
          <p className="text-xs text-[var(--color-muted)]">SKU: {product.sku}</p>

          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold text-[var(--color-primary)]">{formatPrice(product.price)}</p>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                product.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-700'
                  : product.status === 'OUT_OF_STOCK'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {product.status === 'ACTIVE' ? 'In Stock' : product.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Unavailable'}
            </span>
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {product.status === 'ACTIVE' && (
            <div className="flex flex-col gap-3 mt-2">
              <AddToCartButton product={product} />
              <WhatsAppButton product={product} />
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.data.length > 0 && (
        <div>
          <h2 className="font-heading text-xl font-bold text-[var(--color-primary)] mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.data
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
