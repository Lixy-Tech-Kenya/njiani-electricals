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

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

/**
 * Core API request handler (the "interceptor")
 * Abstracts base URL, versioning, headers, and error handling.
 */
async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...init } = options;
  
  // 1. Abstract Base URL & Versioning
  let url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  // 2. Abstract Query Parameters
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // 3. Abstract Headers & Credentials
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...init.headers,
    },
    credentials: init.credentials || 'include',
  });

  // 4. Abstract Error Handling
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || `API error ${response.status}`);
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

/**
 * API Client Methods
 */
const client = {
  get: <T>(path: string, options?: FetchOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: FetchOptions) => 
    request<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown, options?: FetchOptions) => 
    request<T>(path, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown, options?: FetchOptions) => 
    request<T>(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string, options?: FetchOptions) => request<T>(path, { ...options, method: 'DELETE' }),
};

export const api = {
  // Expose the raw client for custom calls
  client,

  products: {
    list: (query?: ProductQueryDto) => client.get<PaginatedResponse<Product>>('/products', { params: query }),
    featured: () => client.get<Product[]>('/products/featured'),
    bySlug: (slug: string) => client.get<Product>(`/products/${slug}`),
  },
  categories: {
    list: () => client.get<Category[]>('/categories'),
    bySlug: (slug: string) => client.get<Category>(`/categories/${slug}`),
  },
  orders: {
    create: (data: CreateOrderDto) => client.post<Order>('/orders', data),
  },
  cart: {
    get: () => client.get<{ cartId: string; items: Array<{ productId: string; quantity: number; product: Product | null }> }>('/cart'),
    addItem: (productId: string, quantity: number) => client.post<{ cartId: string; items: Array<{ productId: string; quantity: number }> }>('/cart/items', { productId, quantity }),
    updateQuantity: (productId: string, quantity: number) => client.patch<{ cartId: string; items: Array<{ productId: string; quantity: number }> }>(`/cart/items/${productId}`, { quantity }),
    removeItem: (productId: string) => client.delete<{ cartId: string; items: Array<{ productId: string; quantity: number }> }>(`/cart/items/${productId}`),
    clear: () => client.delete<{ cartId: string; items: [] }>('/cart'),
  },
  auth: {
    login: (data: LoginDto) => client.post<{ user: { id: string; email: string; name: string; role: string }; access_token: string }>('/auth/login', data),
    logout: () => client.post<{ message: string }>('/auth/logout'),
    me: () => client.get<{ id: string; email: string; name: string; role: string }>('/auth/me'),
  }
};
