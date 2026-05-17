import { Suspense } from 'react';
import { api } from '@/lib/api/client';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilters } from './_components/ProductFilters';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Products' };

interface Props {
  searchParams: { category?: string; search?: string; page?: string; sort?: string };
}

export default async function ProductsPage({ searchParams }: Props) {
  const page = Number(searchParams.page ?? 1);
  const result = await api.products.list({
    category: searchParams.category,
    search: searchParams.search,
    sort: searchParams.sort,
    page,
    limit: 24,
  }).catch(() => ({ data: [], meta: { total: 0, page: 1, limit: 24, totalPages: 1 } }));

  const categories = await api.categories.list().catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-bold text-[var(--color-primary)] mb-6">Products</h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <ProductFilters
            categories={Array.isArray(categories) ? categories : []}
            active={searchParams}
          />
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {result.data.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[var(--color-muted)] text-lg">No products found.</p>
              <p className="text-sm text-[var(--color-muted)] mt-2">Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--color-muted)] mb-4">{result.meta.total} products</p>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.data.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {result.meta.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: result.meta.totalPages }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`?${new URLSearchParams({ ...searchParams, page: String(p) })}`}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium border transition-colors ${
                        p === page
                          ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                          : 'bg-white border-[var(--color-border)] text-gray-700 hover:border-[var(--color-accent)]'
                      }`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
