import type { Product, Category, Order } from '@njiani/shared';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new ApiError(res.status, error.message ?? `Request failed: ${res.status}`);
  }

  const json = await res.json();
  return (json?.data ?? json) as T;
}

export interface ProductsParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const api = {
  products: {
    list: (params?: ProductsParams) => {
      const query = new URLSearchParams(
        Object.entries(params ?? {})
          .filter(([, v]) => v !== undefined && v !== '')
          .map(([k, v]) => [k, String(v)]),
      ).toString();
      return apiFetch<PaginatedResponse<Product>>(`/products${query ? '?' + query : ''}`);
    },
    featured: () => apiFetch<Product[]>('/products/featured'),
    bySlug: (slug: string) => apiFetch<Product>(`/products/${slug}`),
  },

  categories: {
    list: () => apiFetch<Category[]>('/categories'),
    bySlug: (slug: string) => apiFetch<Category>(`/categories/${slug}`),
  },

  orders: {
    create: (body: unknown) =>
      apiFetch<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
};
