import { serverApi } from '@/lib/api/server';
import { CategoryForm } from '../_components/CategoryForm';
import { notFound } from 'next/navigation';
import type { Category } from '@njiani/shared';

export const metadata = { title: 'Edit Category — Njiani Admin' };

interface Props {
  params: { slug: string };
}

export default async function EditCategoryPage({ params }: Props) {
  let category: Category | null = null;

  try {
    category = await serverApi.get<Category>(`/categories/${params.slug}`);
  } catch {
    notFound();
  }

  if (!category) notFound();

  return <CategoryForm category={category} />;
}
