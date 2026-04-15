'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { clientApi } from '@/lib/api/client';
import { queryKeys } from '@/lib/query-keys';
import { StatusBadge } from '../../_components/StatusBadge';
import { formatPrice } from '@njiani/shared';
import { formatDate } from '@/lib/utils';
import type { Order } from '@njiani/shared';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';

interface OrdersResponse {
  data: Order[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const columnHelper = createColumnHelper<Order>();

export function OrdersTable() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const params: Record<string, string> = {
    page: String(page),
    limit: '20',
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => clientApi.get<OrdersResponse>('/orders/admin', params),
  });

  const columns = [
    columnHelper.accessor('referenceNumber', {
      header: 'Reference',
      cell: (info) => (
        <Link
          href={`/orders/${info.row.original.id}`}
          className="font-mono font-medium text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('customerName', {
      header: 'Customer',
      cell: (info) => (
        <div>
          <p className="font-medium text-gray-700">{info.getValue()}</p>
          <p className="text-xs text-[var(--color-muted)]">{info.row.original.customerPhone}</p>
        </div>
      ),
    }),
    columnHelper.accessor('channel', {
      header: 'Channel',
      cell: (info) => <StatusBadge variant={info.getValue()} />,
    }),
    columnHelper.accessor('items', {
      header: 'Items',
      cell: (info) => (
        <span className="text-[var(--color-muted)]">{info.getValue()?.length ?? 0}</span>
      ),
    }),
    columnHelper.accessor('totalAmount', {
      header: 'Total',
      cell: (info) => <span className="font-medium">{formatPrice(info.getValue())}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => <StatusBadge variant={info.getValue()} />,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Date',
      cell: (info) => (
        <span className="text-[var(--color-muted)] text-sm">{formatDate(info.getValue())}</span>
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
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">Orders</h1>

      {/* Status tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-[var(--color-border)] p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-muted)] hover:text-[var(--color-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
                      No orders found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
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

        {totalPages > 1 && (
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
