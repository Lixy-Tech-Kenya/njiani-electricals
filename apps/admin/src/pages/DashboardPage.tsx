import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Package, Clock, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api/client';
import type { Order } from '@njiani/shared';

const STATUS_STYLES: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-700',
  CONFIRMED:  'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  DELIVERED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-700',
};

function StatCard({
  label, value, sub, icon, color,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const date = new Date(order.createdAt).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <span className="font-mono text-sm font-bold text-primary">{order.referenceNumber}</span>
      </td>
      <td className="py-3 px-4">
        <p className="font-medium text-sm">{order.customerName}</p>
        <p className="text-xs text-gray-400">{order.customerPhone}</p>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">
        {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
      </td>
      <td className="py-3 px-4">
        <span className="text-sm font-bold">
          KES {((order.totalAmount ?? 0) / 100).toLocaleString()}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {order.status}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-gray-400">{date}</td>
    </tr>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.orders.stats(),
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Overview of your store's performance</p>
      </div>

      {/* Stat Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
          <StatCard
            label="Total Orders"
            value={stats?.totalOrders ?? 0}
            icon={<ShoppingBag size={22} className="text-primary" />}
            color="bg-primary/10"
          />
          <StatCard
            label="Pending Orders"
            value={stats?.pendingOrders ?? 0}
            sub="Awaiting action"
            icon={<Clock size={22} className="text-yellow-600" />}
            color="bg-yellow-50"
          />
          <StatCard
            label="Total Products"
            value={stats?.totalProducts ?? 0}
            icon={<Package size={22} className="text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            label="Active Products"
            value={stats?.activeProducts ?? 0}
            icon={<CheckCircle2 size={22} className="text-green-600" />}
            color="bg-green-50"
          />
          <StatCard
            label="Out of Stock"
            value={stats?.outOfStockProducts ?? 0}
            icon={<AlertTriangle size={22} className="text-red-500" />}
            color="bg-red-50"
          />
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-accent" />
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
          </div>
          <span className="text-xs text-gray-400">Last 5 orders</span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : !stats?.recentOrders?.length ? (
          <div className="py-16 text-center text-gray-400">
            <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Reference', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
