import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@njiani/shared';

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING', label: 'Pending' },
  { status: 'CONFIRMED', label: 'Confirmed' },
  { status: 'PROCESSING', label: 'Processing' },
  { status: 'DELIVERED', label: 'Delivered' },
];

const STATUS_INDEX: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  DELIVERED: 3,
  CANCELLED: -1,
};

interface StatusStepperProps {
  status: OrderStatus;
}

export function StatusStepper({ status }: StatusStepperProps) {
  const currentIndex = STATUS_INDEX[status] ?? 0;
  const isCancelled = status === 'CANCELLED';

  if (isCancelled) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium text-sm">
        Order Cancelled
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;

        return (
          <div key={step.status} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2',
                  isDone
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                    ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
                    : 'bg-white border-gray-300 text-gray-400',
                )}
              >
                {isDone ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs mt-1 font-medium',
                  isActive ? 'text-[var(--color-accent)]' : isDone ? 'text-green-600' : 'text-gray-400',
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-16 -mt-5',
                  i < currentIndex ? 'bg-green-500' : 'bg-gray-200',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
