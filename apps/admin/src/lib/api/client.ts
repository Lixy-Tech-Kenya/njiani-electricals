import type { 
  Product, 
  Category, 
  Order, 
  CreateProductDto,
  CreateCategoryDto,
  UpdateOrderStatusDto,
  LoginDto,
  Role,
  User
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
    list: (query?: Record<string, string | number | boolean | undefined>) => 
      client.get<PaginatedResponse<Product>>('/products', { params: query }),
    adminList: (query?: Record<string, string | number | boolean | undefined>) =>
      client.get<PaginatedResponse<Product>>('/products', { params: query }),
    create: (data: CreateProductDto) => client.post<Product>('/products', data),
    update: (id: string, data: Partial<CreateProductDto>) => client.patch<Product>(`/products/${id}`, data),
    delete: (id: string) => client.delete<void>(`/products/${id}`),
  },
  categories: {
    list: () => client.get<Category[]>('/categories'),
    create: (data: CreateCategoryDto) => client.post<Category>('/categories', data),
    update: (id: string, data: Partial<CreateCategoryDto>) => client.patch<Category>(`/categories/${id}`, data),
    delete: (id: string) => client.delete<void>(`/categories/${id}`),
  },
  orders: {
    list: (query?: Record<string, string | number | boolean | undefined>) => 
      client.get<PaginatedResponse<Order>>('/orders/admin', { params: query }),
    stats: () => client.get<{
      totalOrders: number;
      pendingOrders: number;
      totalProducts: number;
      activeProducts: number;
      outOfStockProducts: number;
      recentOrders: Order[];
    }>('/orders/admin/stats'),
    byId: (id: string) => client.get<Order>(`/orders/admin/${id}`),
    updateStatus: (id: string, data: UpdateOrderStatusDto) => 
      client.patch<Order>(`/orders/admin/${id}/status`, data),
  },
  auth: {
    login: (data: LoginDto) => client.post<{ user: User; access_token: string }>('/auth/login', data),
    logout: () => client.post<{ message: string }>('/auth/logout'),
    me: (init?: RequestInit) => client.get<User>('/auth/me', init),
  },
  upload: {
    image: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      // Special case: we don't want to set Content-Type header manually for FormData
      return fetch(`${BASE_URL}/admin/upload/image`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      }).then(res => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      });
    }
  }
};
