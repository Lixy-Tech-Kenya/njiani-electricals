'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, MessageCircle, ShoppingBag } from 'lucide-react';

export function SuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle2 className="w-20 h-20 text-green-500" />
      </div>

      <h1 className="font-heading text-3xl font-bold text-[var(--color-primary)] mb-3">
        Order Confirmed!
      </h1>

      <p className="text-[var(--color-muted)] mb-6">
        Thank you for your order. We&apos;ve received your request and will be in touch shortly
        to confirm availability and arrange delivery.
      </p>

      {ref && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-4 mb-8">
          <p className="text-sm text-amber-700 font-medium mb-1">Your reference number</p>
          <p className="font-mono text-xl font-bold text-amber-900">{ref}</p>
          <p className="text-xs text-amber-600 mt-1">Keep this handy when contacting us</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6 mb-8 text-left space-y-4">
        <h2 className="font-semibold text-[var(--color-primary)]">What happens next?</h2>
        <ol className="space-y-3">
          {[
            'Our team reviews your order and checks stock availability.',
            'We contact you via WhatsApp or phone to confirm the details.',
            'Once confirmed, we arrange delivery or pickup at your convenience.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-muted)]">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-slate-800 text-white font-medium py-2.5 px-6 rounded-xl transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>

        <a
          href="https://wa.me/254700000000"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-[var(--color-whatsapp)] hover:bg-green-600 text-white font-medium py-2.5 px-6 rounded-xl transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
