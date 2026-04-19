import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { ShoppingCart, Zap, ShieldCheck, Truck } from 'lucide-react';
import { api } from '@/lib/api/client';
import { useCart } from '@/lib/stores/cart';

export default function HomePage() {
  const addItem = useCart((s) => s.addItem);

  const { data: featured, isLoading: featuredLoading, error: featuredError } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.products.featured(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
  });

  return (
    <>
      {/* Hero */}
      <section className="relative bg-primary text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-alt rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 tracking-tighter leading-tight">
            Powering Your Space
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-gray-300 mb-8 md:mb-10 max-w-2xl mx-auto">
            Discover premium electrical solutions for homes and businesses. Quality products, Kenyan reliability.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link
              to="/products"
              className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg shadow-accent/20"
            >
              Shop Now
            </Link>
            <Link
              to="/products"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all backdrop-blur-sm"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: <Zap size={22} />, title: 'Quality Products', desc: 'Direct from trusted manufacturers and suppliers.', color: 'accent' },
              { icon: <ShieldCheck size={22} />, title: 'Warranty Guaranteed', desc: 'Peace of mind with our standard product warranties.', color: 'accent-alt' },
              { icon: <ShoppingCart size={22} />, title: 'Easy Ordering', desc: 'Order via WhatsApp or Email in a few clicks.', color: 'whatsapp' },
              { icon: <Truck size={22} />, title: 'Fast Delivery', desc: 'Prompt dispatch across Nairobi and major towns.', color: 'primary' },
            ].map(({ icon, title, desc, color }) => (
              <div key={title} className="flex flex-col items-center text-center p-4 md:p-6 rounded-xl bg-gray-50">
                <div className={`w-10 h-10 md:w-12 md:h-12 bg-${color}/10 text-${color} rounded-full flex items-center justify-center mb-3`}>
                  {icon}
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1">{title}</h3>
                <p className="text-xs md:text-sm text-gray-500 hidden sm:block">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Featured Products</h2>
              <p className="text-sm text-gray-500 hidden sm:block">Handpicked selection of our top-selling items.</p>
            </div>
            <Link to="/products" className="text-accent font-bold hover:underline text-sm whitespace-nowrap">View All</Link>
          </div>

          {featuredLoading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-64 md:h-80 animate-pulse" />
              ))}
            </div>
          )}

          {featuredError && <p className="text-red-500 text-sm">Failed to load products.</p>}

          {featured && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featured.map((product) => (
                <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <Link to={`/products/${product.slug}`} className="block aspect-square relative overflow-hidden bg-gray-100">
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="p-3 md:p-4">
                    <p className="text-[9px] md:text-[10px] text-accent font-bold uppercase tracking-widest mb-1 truncate">{product.category?.name}</p>
                    <h3 className="font-bold mb-2 text-sm md:text-base truncate">
                      <Link to={`/products/${product.slug}`} className="hover:text-accent transition-colors">{product.name}</Link>
                    </h3>
                    <div className="flex justify-between items-center gap-2">
                      <p className="font-bold text-sm md:text-lg">KES {(product.price / 100).toLocaleString()}</p>
                      <button
                        onClick={() => addItem(product)}
                        className="bg-primary hover:bg-accent text-white p-2 rounded-lg transition-colors flex-shrink-0"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart size={16} className="md:hidden" />
                        <ShoppingCart size={18} className="hidden md:block" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {categories?.slice(0, 12).map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="bg-white p-4 md:p-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <h3 className="font-bold text-xs md:text-sm leading-snug">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
