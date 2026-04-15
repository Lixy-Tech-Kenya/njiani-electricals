import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: boolean;
}

export function StatCard({ title, value, subtitle, accent }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-5 bg-white shadow-sm',
        accent ? 'border-[var(--color-accent)]/30' : 'border-[var(--color-border)]',
      )}
    >
      <p className="text-sm text-[var(--color-muted)] font-medium">{title}</p>
      <p
        className={cn(
          'text-3xl font-bold mt-1',
          accent ? 'text-[var(--color-accent)]' : 'text-[var(--color-primary)]',
        )}
      >
        {value}
      </p>
      {subtitle && <p className="text-xs text-[var(--color-muted)] mt-1">{subtitle}</p>}
    </div>
  );
}
