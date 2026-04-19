import { create } from 'zustand';
import type { Product } from '@njiani/shared';
import { api } from '../api/client';

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product | null;
}

interface CartState {
  items: CartItem[];
  initialized: boolean;
  sync: () => Promise<void>;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  initialized: false,

  sync: async () => {
    if (get().initialized) return;
    try {
      const data = await api.cart.get();
      set({ items: data.items, initialized: true });
    } catch {
      set({ initialized: true });
    }
  },

  addItem: async (product, quantity = 1) => {
    const res = await api.cart.addItem(product.id, quantity);
    set({ items: res.items as CartItem[] });
  },

  removeItem: async (productId) => {
    const res = await api.cart.removeItem(productId);
    set({ items: res.items as CartItem[] });
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity < 1) {
      const res = await api.cart.removeItem(productId);
      set({ items: res.items as CartItem[] });
      return;
    }
    const res = await api.cart.updateQuantity(productId, quantity);
    set({ items: res.items as CartItem[] });
  },

  clear: async () => {
    await api.cart.clear();
    set({ items: [] });
  },
}));

export const selectItemCount = (s: CartState) =>
  s.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectTotalAmount = (s: CartState) =>
  s.items.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0);
