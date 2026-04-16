'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { api, type ProductsParams } from './api/client';
import { queryKeys } from './query-keys';

export function useFeaturedProducts() {
  return useQuery({
    queryKey: queryKeys.products.featured,
    queryFn: () => api.products.featured(),
  });
}

export function useProducts(params?: ProductsParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params as Record<string, unknown> | undefined),
    queryFn: () => api.products.list(params),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: () => api.products.bySlug(slug),
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list,
    queryFn: () => api.categories.list(),
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(slug),
    queryFn: () => api.categories.bySlug(slug),
    enabled: !!slug,
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (body: unknown) => api.orders.create(body),
  });
}
