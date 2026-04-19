import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router';
import { Search, SlidersHorizontal, ShoppingCart } from 'lucide-react';
import { api } from '@/lib/api/client';
import { useCart } from '@/lib/stores/cart';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const addItem = useCart((s) => s.addItem);

  const category = searchParams.get('category') || '';
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', { category, search: searchTerm, sort }],
    queryFn: () => api.products.list({
      category: category || undefined,
      search: searchTerm || undefined,
      sort: sort || undefined,
    }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
  });

  function handleSortChange(value: string) {
    setSort(value);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('sort', value);
      return next;
    });
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
              <SlidersHorizontal size={20} />
              Filters
            </h2>

            <div className="mb-8">
              <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-4">Categories</h3>
              <div className="flex flex-col gap-2">
                <Link
                  to="/products"
                  className={`text-sm hover:text-accent transition-colors ${category === '' ? 'font-bold text-accent' : ''}`}
                >
                  All Categories
                </Link>
                {categories?.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.slug}`}
                    className={`text-sm hover:text-accent transition-colors ${category === cat.slug ? 'font-bold text-accent' : ''}`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-4">Sort By</h3>
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-200 text-sm bg-white"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A-Z</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products, SKUs, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-transparent bg-white shadow-sm focus:border-accent focus:ring-0 transition-all outline-none"
            />
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-96 animate-pulse"></div>
              ))}
            </div>
          )}

          {!isLoading && productsData?.data.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <p className="text-gray-500 mb-4">No products found matching your criteria.</p>
              <Link to="/products" className="text-accent font-bold hover:underline">Clear all filters</Link>
            </div>
          )}

          {productsData && productsData.data.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsData.data.map((product) => (
                <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group border border-gray-100">
                  <Link to={`/products/${product.slug}`} className="block aspect-square relative overflow-hidden bg-gray-50">
                    <img src={product.imageUrls[0]} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    {product.status === 'OUT_OF_STOCK' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Out of Stock</span>
                      </div>
                    )}
                  </Link>
                  <div className="p-5">
                    <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">{product.category?.name}</p>
                    <h3 className="font-bold mb-3 line-clamp-2 h-12 leading-snug">
                      <Link to={`/products/${product.slug}`} className="hover:text-accent transition-colors">{product.name}</Link>
                    </h3>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-xl">KES {(product.price / 100).toLocaleString()}</p>
                      <button
                        onClick={() => addItem(product)}
                        disabled={product.status === 'OUT_OF_STOCK'}
                        className="bg-primary hover:bg-accent disabled:bg-gray-300 text-white p-3 rounded-xl transition-colors shadow-lg shadow-primary/10"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
