'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { clientApi } from '@/lib/api/client';
import { queryKeys } from '@/lib/query-keys';
import { generateSlug } from '@njiani/shared';
import type { Category } from '@njiani/shared';

interface CategoryFormValues {
  name: string;
  description: string;
  sortOrder: string;
}

interface CategoryFormProps {
  category?: Category;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!category;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    defaultValues: category
      ? {
          name: category.name,
          description: category.description ?? '',
          sortOrder: String(category.sortOrder),
        }
      : { sortOrder: '0' },
  });

  const nameValue = watch('name');
  const slugPreview = generateSlug(nameValue ?? '');

  const mutation = useMutation({
    mutationFn: (values: CategoryFormValues) => {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        sortOrder: parseInt(values.sortOrder, 10) || 0,
        slug: slugPreview,
      };

      if (isEdit) {
        return clientApi.patch<Category>(`/categories/${category.id}`, payload);
      }
      return clientApi.post<Category>('/categories', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      router.push('/categories');
    },
  });

  const onSubmit = handleSubmit((values) => mutation.mutate(values));

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const errorClass = 'text-red-500 text-xs mt-1';

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/categories" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-[var(--color-muted)]" />
        </Link>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">
          {isEdit ? 'Edit Category' : 'New Category'}
        </h1>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6"
      >
        {/* Name */}
        <div>
          <label className={labelClass} htmlFor="name">Category Name *</label>
          <input
            id="name"
            {...register('name', { required: 'Name is required' })}
            className={inputClass}
            placeholder="e.g. LED Floodlights"
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          {nameValue && (
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Slug: <code className="bg-gray-100 px-1 rounded">{slugPreview}</code>
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className={labelClass} htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={3}
            {...register('description')}
            className={inputClass}
            placeholder="Brief description of this category…"
          />
        </div>

        {/* Sort Order */}
        <div className="max-w-xs">
          <label className={labelClass} htmlFor="sortOrder">Sort Order</label>
          <input
            id="sortOrder"
            type="number"
            min="0"
            {...register('sortOrder')}
            className={inputClass}
            placeholder="0"
          />
          <p className="text-xs text-[var(--color-muted)] mt-1">
            Lower numbers appear first
          </p>
        </div>

        {mutation.isError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {mutation.error instanceof Error ? mutation.error.message : 'Something went wrong'}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-red-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Category'}
          </button>
          <Link
            href="/categories"
            className="px-4 py-2.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
