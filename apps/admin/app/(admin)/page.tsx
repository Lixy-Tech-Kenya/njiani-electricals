import Link from 'next/link';
import { serverApi } from '@/lib/api/server';
import { StatCard } from './_components/StatCard';
import { StatusBadge } from './_components/StatusBadge';
import { formatDate } from '@/lib/utils';
import { formatPrice } from '@njiani/shared';
import type { Order } from '@njiani/shared';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  recentOrders: Order[];
}

export default async function DashboardPage() {
  let stats: DashboardStats | null = null;
  let error: string | null = null;

  try {
    stats = await serverApi.get<DashboardStats>('/orders/admin/stats');
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load stats';
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  const inactiveProducts = stats.totalProducts - stats.activeProducts - stats.outOfStockProducts;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Dashboard</h1>
        <p className="text-[var(--color-muted)] text-sm mt-0.5">Overview of your store</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Orders" value={stats.totalOrders} />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          accent={stats.pendingOrders > 0}
          subtitle={stats.pendingOrders > 0 ? 'Needs attention' : 'All caught up'}
        />
        <StatCard title="Total Products" value={stats.totalProducts} />
        <StatCard title="Active Products" value={stats.activeProducts} />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStockProducts}
          accent={stats.outOfStockProducts > 0}
        />
        <StatCard
          title="Inactive Products"
          value={inactiveProducts}
          subtitle="Soft-deleted or hidden"
        />
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-[var(--color-primary)]">Recent Orders</h2>
          <Link
            href="/orders"
            className="text-sm text-[var(--color-accent)] hover:underline font-medium"
          >
            View all
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p className="text-[var(--color-muted)] text-sm px-6 py-8 text-center">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  {['Reference', 'Customer', 'Channel', 'Total', 'Status', 'Date'].map((h) => (
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
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-[var(--color-primary)]">
                      <Link href={`/orders/${order.id}`} className="hover:text-[var(--color-accent)]">
                        {order.referenceNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{order.customerName}</td>
                    <td className="px-6 py-4">
                      <StatusBadge variant={order.channel} />
                    </td>
                    <td className="px-6 py-4 font-medium">{formatPrice(order.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge variant={order.status} />
                    </td>
                    <td className="px-6 py-4 text-[var(--color-muted)]">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
