import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router';
import { Search, SlidersHorizontal, ShoppingCart, X } from 'lucide-react';
import { api } from '@/lib/api/client';
import { useCart } from '@/lib/stores/cart';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const addItem = useCart((s) => s.addItem);

  const category = searchParams.get('category') || '';
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const filterPanel = (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-base flex items-center gap-2">
          <SlidersHorizontal size={18} /> Filters
        </h2>
        {/* Close button shown only in mobile drawer */}
        <button
          onClick={() => setFiltersOpen(false)}
          className="md:hidden p-1 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mb-6">
        <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-3">Categories</h3>
        <div className="flex flex-col gap-1.5">
          <Link
            to="/products"
            onClick={() => setFiltersOpen(false)}
            className={`text-sm py-1 hover:text-accent transition-colors ${category === '' ? 'font-bold text-accent' : ''}`}
          >
            All Categories
          </Link>
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              onClick={() => setFiltersOpen(false)}
              className={`text-sm py-1 hover:text-accent transition-colors ${category === cat.slug ? 'font-bold text-accent' : ''}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-3">Sort By</h3>
        <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full p-2.5 rounded-lg border border-gray-200 text-sm bg-white"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A-Z</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Mobile filter toggle bar */}
      <div className="flex items-center gap-3 mb-4 md:hidden">
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm text-sm font-bold border border-gray-100"
        >
          <SlidersHorizontal size={16} />
          Filters {category && <span className="w-2 h-2 rounded-full bg-accent inline-block" />}
        </button>
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input
            type="text"
            placeholder="Search…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-transparent bg-white shadow-sm focus:border-accent outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Mobile filter drawer overlay */}
      {filtersOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-gray-50 p-4 overflow-y-auto z-50 shadow-2xl">
            {filterPanel}
          </div>
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            {filterPanel}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow min-w-0">
          {/* Desktop search */}
          <div className="relative mb-6 hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products, SKUs, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-transparent bg-white shadow-sm focus:border-accent outline-none transition-all"
            />
          </div>

          {isLoading && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-72 md:h-96 animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && productsData?.data.length === 0 && (
            <div className="bg-white rounded-xl p-10 text-center shadow-sm">
              <p className="text-gray-500 mb-4 text-sm">No products found matching your criteria.</p>
              <Link to="/products" className="text-accent font-bold hover:underline text-sm">Clear all filters</Link>
            </div>
          )}

          {productsData && productsData.data.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {productsData.data.map((product) => (
                <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group border border-gray-100">
                  <Link to={`/products/${product.slug}`} className="block aspect-square relative overflow-hidden bg-gray-50">
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.status === 'OUT_OF_STOCK' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Out of Stock</span>
                      </div>
                    )}
                  </Link>
                  <div className="p-3 md:p-5">
                    <p className="text-[9px] md:text-[10px] text-accent font-bold uppercase tracking-widest mb-1 truncate">{product.category?.name}</p>
                    <h3 className="font-bold mb-2 text-sm md:text-base line-clamp-2 leading-snug">
                      <Link to={`/products/${product.slug}`} className="hover:text-accent transition-colors">{product.name}</Link>
                    </h3>
                    <div className="flex justify-between items-center gap-2">
                      <p className="font-bold text-sm md:text-xl">KES {(product.price / 100).toLocaleString()}</p>
                      <button
                        onClick={() => addItem(product)}
                        disabled={product.status === 'OUT_OF_STOCK'}
                        className="bg-primary hover:bg-accent disabled:bg-gray-300 text-white p-2.5 md:p-3 rounded-xl transition-colors shadow-lg shadow-primary/10 flex-shrink-0"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart size={16} className="md:hidden" />
                        <ShoppingCart size={20} className="hidden md:block" />
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
