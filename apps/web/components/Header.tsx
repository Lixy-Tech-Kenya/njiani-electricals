'use client';

import Link from 'next/link';
import { ShoppingCart, Zap } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';

export function Header() {
  const itemCount = useCartStore((s) => s.itemCount);

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-primary)] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-accent)]">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-heading font-bold text-white text-lg">Njiani Electricals</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <Link href="/products" className="hover:text-white transition-colors">Products</Link>
          <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
        </nav>

        <Link
          href="/cart"
          className="relative flex items-center gap-2 text-white hover:text-[var(--color-accent)] transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-accent)] text-white text-xs font-bold">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
          <span className="hidden sm:inline text-sm">Cart</span>
        </Link>
      </div>
    </header>
  );
}
