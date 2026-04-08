import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CartService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private getCartKey(cartId: string) {
    return `cart:${cartId}`;
  }

  async getCart(cartId: string) {
    if (!cartId) {
      cartId = uuidv4();
    }
    const items: any[] = (await this.cacheManager.get(this.getCartKey(cartId))) || [];
    
    // Enrich with product details
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await this.cacheManager.get(`product:${item.productId}`);
        // If not in cache, we could fetch from DB, but for now let's just return what we have
        return {
          ...item,
          product
        };
      })
    );

    return {
      cartId,
      items: enrichedItems,
    };
  }

  async addItem(cartId: string, item: { productId: string; quantity: number }) {
    const key = this.getCartKey(cartId);
    let items: any[] = (await this.cacheManager.get(key)) || [];
    
    const existingItem = items.find((i) => i.productId === item.productId);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      items.push(item);
    }

    await this.cacheManager.set(key, items, 604800000); // 7 days
    return { cartId, items };
  }

  async updateQuantity(cartId: string, productId: string, quantity: number) {
    const key = this.getCartKey(cartId);
    let items: any[] = (await this.cacheManager.get(key)) || [];
    
    const item = items.find((i) => i.productId === productId);
    if (item) {
      item.quantity = Math.max(0, quantity);
      if (item.quantity === 0) {
        items = items.filter((i) => i.productId !== productId);
      }
    }

    await this.cacheManager.set(key, items, 604800000);
    return { cartId, items };
  }

  async removeItem(cartId: string, productId: string) {
    const key = this.getCartKey(cartId);
    let items: any[] = (await this.cacheManager.get(key)) || [];
    
    items = items.filter((i) => i.productId !== productId);

    await this.cacheManager.set(key, items, 604800000);
    return { cartId, items };
  }

  async clearCart(cartId: string) {
    await this.cacheManager.del(this.getCartKey(cartId));
    return { cartId, items: [] };
  }
}
