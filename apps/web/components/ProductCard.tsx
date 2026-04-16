import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { formatPrice } from '@njiani/shared';
import type { Product } from '@njiani/shared';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl =
    product.imageUrls?.[0]
      ? product.imageUrls[0].startsWith('http')
        ? product.imageUrls[0]
        : `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500'}${product.imageUrls[0]}`
      : null;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-gray-200" />
            </div>
          )}
          {product.isFeatured && (
            <span className="absolute top-2 left-2 bg-[var(--color-secondary)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-[var(--color-muted)] mb-1">{product.category?.name ?? ''}</p>
          <h3 className="font-medium text-[var(--color-primary)] text-sm line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
            {product.name}
          </h3>
          <p className="font-bold text-[var(--color-primary)] mt-2">{formatPrice(product.price)}</p>
        </div>
      </div>
    </Link>
  );
}
