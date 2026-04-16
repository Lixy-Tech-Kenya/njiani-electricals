'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { Category } from '@njiani/shared';

interface ProductFiltersProps {
  categories: Category[];
  active: { category?: string; search?: string; sort?: string };
}

export function ProductFilters({ categories, active }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">Search</label>
        <input
          type="text"
          defaultValue={active.search ?? ''}
          placeholder="Search products…"
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              applyFilter('search', (e.target as HTMLInputElement).value);
            }
          }}
        />
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">Category</label>
        <div className="space-y-1 max-h-72 overflow-y-auto">
          <button
            onClick={() => applyFilter('category', '')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
              !active.category
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => applyFilter('category', cat.slug)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                active.category === cat.slug
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-primary)] mb-2">Sort By</label>
        <select
          value={active.sort ?? ''}
          onChange={(e) => applyFilter('sort', e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        >
          <option value="">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name A–Z</option>
        </select>
      </div>
    </div>
  );
}
