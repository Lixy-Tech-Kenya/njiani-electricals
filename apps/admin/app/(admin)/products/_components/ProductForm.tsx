'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { clientApi } from '@/lib/api/client';
import { queryKeys } from '@/lib/query-keys';
import { ImageUpload } from './ImageUpload';
import { generateSlug } from '@njiani/shared';
import type { Product, Category } from '@njiani/shared';

interface ProductFormValues {
  name: string;
  sku: string;
  categoryId: string;
  price: string;        // input as KES string, converted to cents on submit
  description: string;
  imageUrls: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  isFeatured: boolean;
}

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!product;

  const { data: categories } = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => clientApi.get<Category[]>('/categories'),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    defaultValues: product
      ? {
          name: product.name,
          sku: product.sku,
          categoryId: product.categoryId,
          price: String(Math.round(product.price / 100)),
          description: product.description,
          imageUrls: product.imageUrls,
          status: product.status,
          isFeatured: product.isFeatured,
        }
      : {
          status: 'ACTIVE',
          isFeatured: false,
          imageUrls: [],
        },
  });

  const nameValue = watch('name');
  const slugPreview = generateSlug(nameValue ?? '');

  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const priceInCents = Math.round(parseFloat(values.price) * 100);
      const payload = { ...values, price: priceInCents };

      if (isEdit) {
        return clientApi.patch<Product>(`/products/${product.id}`, payload);
      }
      return clientApi.post<Product>('/products', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      router.push('/products');
    },
  });

  const onSubmit = handleSubmit((values) => mutation.mutate(values));

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const errorClass = 'text-red-500 text-xs mt-1';

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/products" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-[var(--color-muted)]" />
        </Link>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">
          {isEdit ? 'Edit Product' : 'New Product'}
        </h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6">
        {/* Name */}
        <div>
          <label className={labelClass} htmlFor="name">Product Name *</label>
          <input
            id="name"
            {...register('name', { required: 'Name is required' })}
            className={inputClass}
            placeholder="e.g. LED Floodlight 50W"
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          {nameValue && (
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Slug: <code className="bg-gray-100 px-1 rounded">{slugPreview}</code>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* SKU */}
          <div>
            <label className={labelClass} htmlFor="sku">SKU *</label>
            <input
              id="sku"
              {...register('sku', { required: 'SKU is required' })}
              className={inputClass}
              placeholder="e.g. NJE-LED-001"
            />
            {errors.sku && <p className={errorClass}>{errors.sku.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className={labelClass} htmlFor="categoryId">Category *</label>
            <select
              id="categoryId"
              {...register('categoryId', { required: 'Category is required' })}
              className={inputClass}
            >
              <option value="">Select category…</option>
              {(Array.isArray(categories) ? categories : []).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className={errorClass}>{errors.categoryId.message}</p>}
          </div>
        </div>

        {/* Price */}
        <div className="max-w-xs">
          <label className={labelClass} htmlFor="price">Price (KES) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm font-medium">
              KES
            </span>
            <input
              id="price"
              type="number"
              min="0"
              step="1"
              {...register('price', { required: 'Price is required', min: { value: 0, message: 'Price must be positive' } })}
              className={`${inputClass} pl-12`}
              placeholder="1500"
            />
          </div>
          {errors.price && <p className={errorClass}>{errors.price.message}</p>}
          <p className="text-xs text-[var(--color-muted)] mt-1">Enter price in full KES (e.g. 1500 for KES 1,500)</p>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass} htmlFor="description">Description *</label>
          <textarea
            id="description"
            rows={4}
            {...register('description', { required: 'Description is required' })}
            className={inputClass}
            placeholder="Describe the product…"
          />
          {errors.description && <p className={errorClass}>{errors.description.message}</p>}
        </div>

        {/* Images */}
        <div>
          <label className={labelClass}>Product Images</label>
          <Controller
            name="imageUrls"
            control={control}
            render={({ field }) => (
              <ImageUpload value={field.value ?? []} onChange={field.onChange} />
            )}
          />
        </div>

        {/* Status */}
        <div>
          <label className={labelClass}>Status</label>
          <div className="flex gap-4">
            {(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'] as const).map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={s}
                  {...register('status')}
                  className="accent-[var(--color-accent)]"
                />
                <span className="text-sm text-gray-700">{s.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Featured */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('isFeatured')}
              className="w-4 h-4 accent-[var(--color-accent)]"
            />
            <span className="text-sm font-medium text-gray-700">
              Feature on homepage
            </span>
          </label>
        </div>

        {/* Error */}
        {mutation.isError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {mutation.error instanceof Error ? mutation.error.message : 'Something went wrong'}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-red-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {(isSubmitting || mutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Product'}
          </button>
          <Link
            href="/products"
            className="px-4 py-2.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
