import type { Product, Category, Order } from '@njiani/shared';

// ─── Types ────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
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

// ─── Interceptor ──────────────────────────────────────────────────────────────

interface RequestConfig extends Omit<RequestInit, 'headers'> {
  headers: Record<string, string>;
}
type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = (res: Response) => Response | Promise<Response>;

function createInterceptor() {
  const requestInterceptors: RequestInterceptor[] = [];
  const responseInterceptors: ResponseInterceptor[] = [];

  return {
    request: { use: (fn: RequestInterceptor) => { requestInterceptors.push(fn); } },
    response: { use: (fn: ResponseInterceptor) => { responseInterceptors.push(fn); } },
    async run(path: string, init?: RequestInit): Promise<Response> {
      const rawHeaders = init?.headers;
      const flatHeaders: Record<string, string> =
        rawHeaders == null ? {} :
        rawHeaders instanceof Headers
          ? Object.fromEntries(rawHeaders.entries())
          : Array.isArray(rawHeaders)
            ? Object.fromEntries(rawHeaders)
            : rawHeaders as Record<string, string>;

      let config: RequestConfig = { ...init, headers: flatHeaders };

      for (const fn of requestInterceptors) {
        config = await fn(config);
      }

      const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3500';
      let response = await fetch(`${base}/api/v1${path}`, config);

      for (const fn of responseInterceptors) {
        response = await fn(response);
      }

      return response;
    },
  };
}

// ─── Client factory ───────────────────────────────────────────────────────────

function createClient() {
  const interceptor = createInterceptor();

  // ── Request interceptors ─────────────────────────────────────────────────
  // 1. Default headers
  interceptor.request.use((config) => ({
    ...config,
    headers: { 'Content-Type': 'application/json', ...config.headers },
  }));

  // ── Response interceptors ─────────────────────────────────────────────────
  // 1. Error normalisation
  interceptor.response.use(async (res) => {
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(res.status, body.message ?? `Request failed: ${res.status}`);
    }
    return res;
  });

  // ── Core verbs ────────────────────────────────────────────────────────────
  async function get<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await interceptor.run(path, { cache: 'no-store', ...init, method: 'GET' });
    return res.json();
  }

  async function post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    const res = await interceptor.run(path, {
      ...init,
      method: 'POST',
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function patch<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    const res = await interceptor.run(path, {
      ...init,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function del<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await interceptor.run(path, { ...init, method: 'DELETE' });
    return res.json();
  }

  // ── Typed domain helpers ──────────────────────────────────────────────────
  return {
    get,
    post,
    patch,
    delete: del,
    interceptors: interceptor,

    products: {
      list: (params?: ProductsParams) => {
        const query = new URLSearchParams(
          Object.entries(params ?? {})
            .filter(([, v]) => v !== undefined && v !== '')
            .map(([k, v]) => [k, String(v)]),
        ).toString();
        return get<PaginatedResponse<Product>>(`/products${query ? '?' + query : ''}`);
      },
      featured: () => get<Product[]>('/products/featured'),
      bySlug: (slug: string) => get<Product>(`/products/${slug}`),
    },

    categories: {
      list: () => get<Category[]>('/categories'),
      bySlug: (slug: string) => get<Category>(`/categories/${slug}`),
    },

    orders: {
      create: (body: unknown) => post<Order>('/orders', body),
    },
  };
}

export const api = createClient();
