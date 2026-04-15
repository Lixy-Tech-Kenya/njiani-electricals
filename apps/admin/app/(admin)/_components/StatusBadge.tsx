import { cn } from '@/lib/utils';

type Variant = 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled' | 'whatsapp' | 'email' | 'active' | 'inactive' | 'out_of_stock';

const VARIANT_STYLES: Record<Variant, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  whatsapp: 'bg-green-100 text-green-800',
  email: 'bg-indigo-100 text-indigo-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  out_of_stock: 'bg-red-100 text-red-800',
};

const LABELS: Record<Variant, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  whatsapp: 'WhatsApp',
  email: 'Email',
  active: 'Active',
  inactive: 'Inactive',
  out_of_stock: 'Out of Stock',
};

interface StatusBadgeProps {
  variant: string;
}

export function StatusBadge({ variant }: StatusBadgeProps) {
  const key = variant.toLowerCase() as Variant;
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        VARIANT_STYLES[key] ?? 'bg-gray-100 text-gray-600',
      )}
    >
      {LABELS[key] ?? variant}
    </span>
  );
}
