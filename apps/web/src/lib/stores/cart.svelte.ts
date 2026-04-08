import type { Product } from '@njiani/shared';
import { api } from '$lib/api/client';

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

function createCart() {
  let items = $state<CartItem[]>([]);
  let initialized = false;

  async function sync() {
    try {
      const data = await api.cart.get();
      // In Phase 1, we might need to fetch product details for each item 
      // if the cart API only returns IDs. 
      // For simplicity here, let's assume we fetch details when needed or 
      // the backend returns enough info.
      items = data.items;
    } catch (e) {
      console.error('Failed to sync cart', e);
    }
  }

  return {
    get items() { 
      if (!initialized && typeof window !== 'undefined') {
        initialized = true;
        sync();
      }
      return items; 
    },
    get totalAmount() {
      return items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    },
    get itemCount() {
      return items.reduce((sum, item) => sum + item.quantity, 0);
    },
    async addItem(product: Product, quantity = 1) {
      const res = await api.cart.addItem(product.id, quantity);
      // Re-fetch or update local state
      items = res.items;
    },
    async removeItem(productId: string) {
      const res = await api.cart.removeItem(productId);
      items = res.items;
    },
    async updateQuantity(productId: string, quantity: number) {
      const res = await api.cart.updateQuantity(productId, quantity);
      items = res.items;
    },
    async clear() {
      await api.cart.clear();
      items = [];
    },
    sync
  };
}

export const cart = createCart();
