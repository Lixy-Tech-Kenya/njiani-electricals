import { Suspense } from 'react';
import { SuccessContent } from './_components/SuccessContent';

export const metadata = { title: 'Order Confirmed' };

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-[var(--color-muted)]">Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
