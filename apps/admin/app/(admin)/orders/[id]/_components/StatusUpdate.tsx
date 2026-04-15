'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { clientApi } from '@/lib/api/client';
import { queryKeys } from '@/lib/query-keys';
import type { OrderStatus } from '@njiani/shared';

const STATUS_OPTIONS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'DELIVERED',
  'CANCELLED',
];

interface StatusUpdateProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function StatusUpdate({ orderId, currentStatus }: StatusUpdateProps) {
  const [selected, setSelected] = useState<OrderStatus>(currentStatus);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (status: OrderStatus) =>
      clientApi.patch(`/orders/admin/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });

  return (
    <div className="flex items-center gap-3">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value as OrderStatus)}
        className="px-4 py-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-sm"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
      <button
        onClick={() => mutation.mutate(selected)}
        disabled={mutation.isPending || selected === currentStatus}
        className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
      >
        {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        Update Status
      </button>
      {mutation.isSuccess && (
        <span className="text-green-600 text-sm font-medium">✓ Updated</span>
      )}
    </div>
  );
}
