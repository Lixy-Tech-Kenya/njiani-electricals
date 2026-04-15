'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { clientApi } from '@/lib/api/client';
import { queryKeys } from '@/lib/query-keys';
import type { Category } from '@njiani/shared';

const columnHelper = createColumnHelper<Category>();

export function CategoriesTable() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => clientApi.get<Category[]>('/categories'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientApi.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
    onError: (err) => alert(err instanceof Error ? err.message : 'Delete failed'),
  });

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => (
        <span className="font-medium text-[var(--color-primary)]">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('slug', {
      header: 'Slug',
      cell: (info) => (
        <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-[var(--color-muted)]">
          {info.getValue()}
        </code>
      ),
    }),
    columnHelper.accessor('sortOrder', {
      header: 'Sort Order',
      cell: (info) => <span className="text-[var(--color-muted)]">{info.getValue()}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/categories/${info.row.original.slug}`}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              if (confirm(`Delete "${info.row.original.name}"? This will fail if the category has products.`)) {
                deleteMutation.mutate(info.row.original.id);
              }
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-muted)] hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }),
  ];

  const categories = Array.isArray(data) ? data : [];
  const table = useReactTable({
    data: categories,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Categories</h1>
        <Link
          href="/categories/new"
          className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New Category
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-[var(--color-border)]">
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center text-[var(--color-muted)]">
                      No categories yet
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
