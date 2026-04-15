export const queryKeys = {
  dashboard: {
    stats: ['admin', 'dashboard', 'stats'] as const,
  },
  products: {
    all: ['admin', 'products'] as const,
    list: (params: Record<string, unknown>) => ['admin', 'products', 'list', params] as const,
    detail: (id: string) => ['admin', 'products', id] as const,
  },
  categories: {
    all: ['admin', 'categories'] as const,
    list: () => ['admin', 'categories', 'list'] as const,
    detail: (id: string) => ['admin', 'categories', id] as const,
  },
  orders: {
    all: ['admin', 'orders'] as const,
    list: (params: Record<string, unknown>) => ['admin', 'orders', 'list', params] as const,
    detail: (id: string) => ['admin', 'orders', id] as const,
  },
} as const;
