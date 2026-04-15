'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { clientApi } from '@/lib/api/client';
import { queryKeys } from '@/lib/query-keys';
import { StatusBadge } from '../../_components/StatusBadge';
import { formatPrice } from '@njiani/shared';
import type { Product } from '@njiani/shared';
import { formatDate } from '@/lib/utils';

interface ProductsResponse {
  data: Product[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const columnHelper = createColumnHelper<Product>();

export function ProductsTable() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const params: Record<string, string> = {
    page: String(page),
    limit: '20',
    ...(search ? { search } : {}),
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => clientApi.get<ProductsResponse>('/products', params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      clientApi.patch(`/products/${id}`, { status: 'INACTIVE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });

  const columns = [
    columnHelper.accessor('name', {
      header: 'Product',
      cell: (info) => (
        <div>
          <p className="font-medium text-[var(--color-primary)]">{info.getValue()}</p>
          <p className="text-xs text-[var(--color-muted)]">{info.row.original.sku}</p>
        </div>
      ),
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      cell: (info) => <span className="font-medium">{formatPrice(info.getValue())}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => <StatusBadge variant={info.getValue()} />,
    }),
    columnHelper.accessor('isFeatured', {
      header: 'Featured',
      cell: (info) => (
        <span className={info.getValue() ? 'text-[var(--color-secondary)] font-medium' : 'text-[var(--color-muted)]'}>
          {info.getValue() ? '★ Yes' : '—'}
        </span>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: (info) => <span className="text-[var(--color-muted)] text-sm">{formatDate(info.getValue())}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/products/${info.row.original.slug}`}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              if (confirm(`Archive "${info.row.original.name}"?`)) {
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

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.meta.totalPages ?? 0,
  });

  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Products</h1>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
        <input
          type="text"
          placeholder="Search products…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setSearch(searchInput);
              setPage(1);
            }
          }}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
        />
      </div>

      {/* Table */}
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
                      No products found
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

        {/* Pagination */}
        {(data?.meta.totalPages ?? 0) > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-muted)]">
              Page {page} of {totalPages} · {data?.meta.total ?? 0} total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
