'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import type { Product } from '@njiani/shared';

export function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  function handleAdd() {
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrls?.[0],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex items-center gap-3">
      {/* Quantity stepper */}
      <div className="flex items-center border border-[var(--color-border)] rounded-lg overflow-hidden">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-3 py-2 hover:bg-gray-100 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="px-4 py-2 font-medium text-sm min-w-[3rem] text-center">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => q + 1)}
          className="px-3 py-2 hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={handleAdd}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-6 rounded-lg font-medium transition-colors ${
          added
            ? 'bg-green-500 text-white'
            : 'bg-[var(--color-primary)] hover:bg-slate-800 text-white'
        }`}
      >
        <ShoppingCart className="w-4 h-4" />
        {added ? 'Added!' : 'Add to Cart'}
      </button>
    </div>
  );
}
