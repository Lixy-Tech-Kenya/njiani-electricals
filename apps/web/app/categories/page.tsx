import Link from 'next/link';
import { Zap } from 'lucide-react';
import { api } from '@/lib/api/client';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Categories' };

export default async function CategoriesPage() {
  const categories = await api.categories.list().catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-bold text-[var(--color-primary)] mb-8">All Categories</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(Array.isArray(categories) ? categories : []).map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-[var(--color-border)] bg-white hover:border-[var(--color-accent)] hover:shadow-md transition-all text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:bg-[var(--color-accent)] transition-colors">
              <Zap className="w-6 h-6 text-[var(--color-primary)] group-hover:text-white transition-colors" />
            </div>
            <span className="font-medium text-[var(--color-primary)] text-sm">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
