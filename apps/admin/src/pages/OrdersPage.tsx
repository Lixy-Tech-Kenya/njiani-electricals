import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api/client';
import type { Order, OrderStatus } from '@njiani/shared';
import Modal from '@/components/Modal';

const STATUS_STYLES: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-700',
  CONFIRMED:  'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  DELIVERED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-700',
};

const ALL_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'DELIVERED', 'CANCELLED'];

function OrderDetailModal({ order, open, onClose }: { order: Order | null; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const updateStatus = useMutation({
    mutationFn: (status: OrderStatus) => api.orders.updateStatus(order!.id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  });

  if (!order) return null;

  return (
    <Modal open={open} title={`Order — ${order.referenceNumber}`} onClose={onClose} width="max-w-3xl">
      {/* Status bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Update Status:</span>
        {ALL_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => updateStatus.mutate(s)}
            disabled={order.status === s || updateStatus.isPending}
            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border-2 transition-all disabled:opacity-50 ${
              order.status === s
                ? `${STATUS_STYLES[s]} border-transparent`
                : 'border-gray-200 text-gray-400 hover:border-gray-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Customer info */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
        {[
          ['Reference', order.referenceNumber],
          ['Customer', order.customerName],
          ['Phone', order.customerPhone],
          ['Email', order.customerEmail || '—'],
          ['Location', order.customerLocation || '—'],
          ['Channel', order.channel],
          ['Notes', order.notes || '—'],
          ['Date', new Date(order.createdAt).toLocaleString('en-KE')],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Items table */}
      <h3 className="font-bold text-sm mb-3 text-gray-700">Order Items</h3>
      <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Product', 'SKU', 'Qty', 'Unit Price', 'Subtotal'].map(h => (
                <th key={h} className="py-2.5 px-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="py-2.5 px-4 font-medium">{item.productName}</td>
                <td className="py-2.5 px-4 text-gray-500 font-mono text-xs">{item.sku}</td>
                <td className="py-2.5 px-4">{item.quantity}</td>
                <td className="py-2.5 px-4">KES {(item.unitPrice / 100).toLocaleString()}</td>
                <td className="py-2.5 px-4 font-bold">KES {((item.unitPrice * item.quantity) / 100).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-gray-200 bg-gray-50">
            <tr>
              <td colSpan={4} className="py-3 px-4 font-bold text-right text-sm">Total</td>
              <td className="py-3 px-4 font-bold text-primary text-sm">KES {(order.totalAmount / 100).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Modal>
  );
}

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', { page, status: statusFilter }],
    queryFn: () => api.orders.list({ page, limit: 15, ...(statusFilter ? { status: statusFilter } : {}) }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">{data?.meta.total ?? '—'} total orders</p>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setStatusFilter(''); setPage(1); }}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${!statusFilter ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
          >
            All
          </button>
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${statusFilter === s ? `${STATUS_STYLES[s]} border-transparent` : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : !data?.data.length ? (
          <div className="py-20 text-center text-gray-400 text-sm">No orders found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Reference', 'Customer', 'Phone', 'Items', 'Total', 'Channel', 'Status', 'Date', ''].map(h => (
                      <th key={h} className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.data.map(order => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-primary">{order.referenceNumber}</td>
                      <td className="py-3 px-4 text-sm font-medium">{order.customerName}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{order.customerPhone}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{order.items?.length ?? 0}</td>
                      <td className="py-3 px-4 text-sm font-bold">KES {(order.totalAmount / 100).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${order.channel === 'WHATSAPP' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {order.channel}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-KE')}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => setSelected(order)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-primary">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">Page {data.meta.page} of {data.meta.totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))} disabled={page === data.meta.totalPages} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <OrderDetailModal order={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}
