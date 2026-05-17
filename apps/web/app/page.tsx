import Link from 'next/link';
import { Zap, ShoppingBag, MessageCircle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api/client';
import { ProductCard } from '@/components/ProductCard';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Shop electrical products online — LED lights, solar, cables & switches.',
};

export default async function HomePage() {
  const [featuredResult, categoriesResult] = await Promise.allSettled([
    api.products.featured(),
    api.categories.list(),
  ]);

  const featured = featuredResult.status === 'fulfilled' ? featuredResult.value : [];
  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];

  return (
    <>
      {/* Hero */}
      <section className="bg-[var(--color-primary)] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/30 rounded-full px-4 py-1.5 text-sm text-[var(--color-accent)] font-medium mb-6">
            <Zap className="w-4 h-4" />
            Kenya&apos;s Electrical Superstore
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Power Your Space with{' '}
            <span className="text-[var(--color-accent)]">Quality Electricals</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Browse hundreds of LED lights, solar solutions, cables, switches and more. Order via WhatsApp or Email — fast and simple.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-accent)] hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-xl transition-colors text-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop Now
            </Link>
            <Link
              href="/cart"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-xl transition-colors text-lg border border-white/20"
            >
              View Cart
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-primary)]">
              Featured Products
            </h2>
            <Link href="/products" className="text-[var(--color-accent)] hover:underline text-sm font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(Array.isArray(featured) ? featured : []).slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-primary)] mb-8">
              Shop by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(Array.isArray(categories) ? categories : []).slice(0, 12).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-red-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-accent)] transition-colors">
                    <Zap className="w-4 h-4 text-[var(--color-primary)] group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-[var(--color-primary)] line-clamp-2">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/categories" className="text-[var(--color-accent)] hover:underline font-medium">
                View all categories →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How to order */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-primary)] text-center mb-12">
          How to Order
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: ShoppingBag,
              step: '1',
              title: 'Browse & Add to Cart',
              desc: 'Explore our full catalogue and add items to your cart.',
            },
            {
              icon: CheckCircle,
              step: '2',
              title: 'Fill Your Details',
              desc: 'Enter your name, phone number and delivery location.',
            },
            {
              icon: MessageCircle,
              step: '3',
              title: 'Send via WhatsApp or Email',
              desc: 'We confirm availability and arrange delivery with you directly.',
            },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-primary)] mb-4 relative">
                <Icon className="w-7 h-7 text-white" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs font-bold flex items-center justify-center">
                  {step}
                </span>
              </div>
              <h3 className="font-semibold text-lg text-[var(--color-primary)] mb-2">{title}</h3>
              <p className="text-[var(--color-muted)] text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
