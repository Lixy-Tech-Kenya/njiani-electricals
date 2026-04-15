import { serverApi } from '@/lib/api/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, MapPin } from 'lucide-react';
import { StatusBadge } from '../../_components/StatusBadge';
import { StatusStepper } from './_components/StatusStepper';
import { StatusUpdate } from './_components/StatusUpdate';
import { formatPrice } from '@njiani/shared';
import { formatDate } from '@/lib/utils';
import type { Order } from '@njiani/shared';

export const metadata = { title: 'Order Detail — Njiani Admin' };

interface Props {
  params: { id: string };
}

export default async function OrderDetailPage({ params }: Props) {
  let order: Order | null = null;

  try {
    order = await serverApi.get<Order>(`/orders/admin/${params.id}`);
  } catch {
    notFound();
  }

  if (!order) notFound();

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/orders" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-[var(--color-muted)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)] font-mono">
            {order.referenceNumber}
          </h1>
          <p className="text-[var(--color-muted)] text-sm mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge variant={order.channel} />
          <StatusBadge variant={order.status} />
        </div>
      </div>

      {/* Status stepper */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6">
        <h2 className="font-semibold text-[var(--color-primary)] mb-4">Order Status</h2>
        <StatusStepper status={order.status} />
        <div className="mt-5 pt-5 border-t border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-muted)] mb-3 font-medium">Update status</p>
          <StatusUpdate orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer info */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6">
          <h2 className="font-semibold text-[var(--color-primary)] mb-4">Customer Details</h2>
          <div className="space-y-3">
            <p className="font-medium text-gray-800">{order.customerName}</p>
            <a
              href={`tel:${order.customerPhone}`}
              className="flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline"
            >
              <Phone className="w-4 h-4" />
              {order.customerPhone}
            </a>
            {order.customerEmail && (
              <a
                href={`mailto:${order.customerEmail}`}
                className="flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline"
              >
                <Mail className="w-4 h-4" />
                {order.customerEmail}
              </a>
            )}
            {order.customerLocation && (
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-[var(--color-muted)]" />
                {order.customerLocation}
              </p>
            )}
            {order.notes && (
              <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-muted)] font-medium mb-1">Notes</p>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6">
          <h2 className="font-semibold text-[var(--color-primary)] mb-4">Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">Items</span>
              <span>{order.items?.length ?? 0}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-[var(--color-border)]">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-[var(--color-primary)]">Order Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {['Product', 'SKU', 'Qty', 'Unit Price', 'Line Total'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {(order.items ?? []).map((item, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 font-medium text-gray-700">{item.productName}</td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{item.sku}</code>
                  </td>
                  <td className="px-6 py-4 text-[var(--color-muted)]">{item.quantity}</td>
                  <td className="px-6 py-4">{formatPrice(item.unitPrice)}</td>
                  <td className="px-6 py-4 font-medium">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr className="border-t border-[var(--color-border)]">
                <td colSpan={4} className="px-6 py-4 font-semibold text-right">
                  Total
                </td>
                <td className="px-6 py-4 font-bold text-[var(--color-primary)]">
                  {formatPrice(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
