import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from '@njiani/shared';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  itemCount: number;
}

function computeTotals(items: CartItem[]) {
  return {
    totalAmount: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalAmount: 0,
      itemCount: 0,

      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === item.productId);
        const updated = existing
          ? items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            )
          : [...items, item];
        set({ items: updated, ...computeTotals(updated) });
      },

      removeItem: (productId) => {
        const updated = get().items.filter((i) => i.productId !== productId);
        set({ items: updated, ...computeTotals(updated) });
      },

      updateQuantity: (productId, quantity) => {
        const clamped = Math.max(1, quantity);
        const updated = get().items.map((i) =>
          i.productId === productId ? { ...i, quantity: clamped } : i,
        );
        set({ items: updated, ...computeTotals(updated) });
      },

      clearCart: () => set({ items: [], totalAmount: 0, itemCount: 0 }),
    }),
    {
      name: 'njiani-cart',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
