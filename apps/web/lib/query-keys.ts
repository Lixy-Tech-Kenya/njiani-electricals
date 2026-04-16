export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (params: Record<string, unknown> | undefined) => ['products', 'list', params] as const,
    featured: ['products', 'featured'] as const,
    detail: (slug: string) => ['products', slug] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: ['categories', 'list'] as const,
    detail: (slug: string) => ['categories', slug] as const,
  },
} as const;
