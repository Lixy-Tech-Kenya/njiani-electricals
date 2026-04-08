import type { 
  Product, 
  Category, 
  Order, 
  CreateOrderDto, 
  ProductQueryDto,
  LoginDto
} from '@njiani/shared';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
      return request<PaginatedResponse<Product>>(`/api/products?${params.toString()}`);
    },
    featured: () => request<Product[]>('/api/products/featured'),
    bySlug: (slug: string) => request<Product>(`/api/products/${slug}`),
  },
  categories: {
    list: () => request<Category[]>('/api/categories'),
    bySlug: (slug: string) => request<Category>(`/api/categories/${slug}`),
  },
  orders: {
    create: (data: CreateOrderDto) => request<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },
  cart: {
    get: () => request<any>('/api/cart'),
    addItem: (productId: string, quantity: number) => request<any>('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),
    updateQuantity: (productId: string, quantity: number) => request<any>(`/api/cart/items/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),
    removeItem: (productId: string) => request<any>(`/api/cart/items/${productId}`, {
      method: 'DELETE',
    }),
    clear: () => request<any>('/api/cart', { method: 'DELETE' }),
  },
  auth: {
    login: (data: LoginDto) => request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    logout: () => request<any>('/api/auth/logout', { method: 'POST' }),
    me: () => request<any>('/api/auth/me'),
  }
};
