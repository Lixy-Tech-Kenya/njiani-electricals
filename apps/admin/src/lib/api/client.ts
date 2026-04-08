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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  
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
    list: (query?: Record<string, string | number | boolean | undefined>) => {
      const params = new URLSearchParams(query as Record<string, string>);
      return request<PaginatedResponse<Product>>(`/products?${params.toString()}`);
    },
    adminList: (query?: Record<string, string | number | boolean | undefined>) => {
      const params = new URLSearchParams(query as Record<string, string>);
      return request<PaginatedResponse<Product>>(`/admin/products?${params.toString()}`);
    },
    create: (data: CreateProductDto) => request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<CreateProductDto>) => request<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request<void>(`/products/${id}`, { method: 'DELETE' }),
  },
  categories: {
    list: () => request<Category[]>('/categories'),
    create: (data: CreateCategoryDto) => request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: Partial<CreateCategoryDto>) => request<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request<void>(`/categories/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: (query?: Record<string, string | number | boolean | undefined>) => {
      const params = new URLSearchParams(query as Record<string, string>);
      return request<PaginatedResponse<Order>>(`/orders/admin?${params.toString()}`);
    },
    stats: () => request<{ totalOrders: number; totalRevenue: number; pendingOrders: number }>('/orders/admin/stats'),
    byId: (id: string) => request<Order>(`/orders/admin/${id}`),
    updateStatus: (id: string, data: UpdateOrderStatusDto) => request<Order>(`/orders/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  },
  auth: {
    login: (data: LoginDto) => request<{ user: User; access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
    me: (init?: RequestInit) => request<User>('/auth/me', init),
  },
  upload: {
    image: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return fetch(`${BASE_URL}/admin/upload/image`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      }).then(res => res.json());
    }
  }
};
