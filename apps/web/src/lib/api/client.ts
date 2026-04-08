import type { 
  Product, 
  Category, 
  Order, 
  CreateOrderDto, 
  ProductQueryDto,
  LoginDto
} from '@njiani/shared';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3500/api/v1';

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  
  // For client-side requests, credentials: 'include' is important for cookies
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    credentials: init?.credentials || 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || `API error ${response.status}`);
  }

  return response.json();
}

export const api = {
  products: {
    list: (query?: ProductQueryDto) => {
      const params = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined) params.append(key, String(value));
        });
      }
      return request<PaginatedResponse<Product>>(`/products?${params.toString()}`);
    },
    featured: () => request<Product[]>('/products/featured'),
    bySlug: (slug: string) => request<Product>(`/products/${slug}`),
  },
  categories: {
    list: () => request<Category[]>('/categories'),
    bySlug: (slug: string) => request<Category>(`/categories/${slug}`),
  },
  orders: {
    create: (data: CreateOrderDto) => request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
  cart: {
    get: () => request<{ cartId: string; items: Array<{ productId: string; quantity: number; product: Product | null }> }>('/cart'),
    addItem: (productId: string, quantity: number) => request<{ cartId: string; items: Array<{ productId: string; quantity: number }> }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),
    updateQuantity: (productId: string, quantity: number) => request<{ cartId: string; items: Array<{ productId: string; quantity: number }> }>(`/cart/items/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),
    removeItem: (productId: string) => request<{ cartId: string; items: Array<{ productId: string; quantity: number }> }>(`/cart/items/${productId}`, {
      method: 'DELETE',
    }),
    clear: () => request<{ cartId: string; items: [] }>('/cart', { method: 'DELETE' }),
  },
  auth: {
    login: (data: LoginDto) => request<{ user: { id: string; email: string; name: string; role: string }; access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
    me: () => request<{ id: string; email: string; name: string; role: string }>('/auth/me'),
  }
};
