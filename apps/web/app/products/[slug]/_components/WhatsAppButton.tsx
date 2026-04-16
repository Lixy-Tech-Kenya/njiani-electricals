'use client';

import { MessageCircle } from 'lucide-react';
import { buildWhatsAppOrderUrl, formatPrice } from '@njiani/shared';
import type { Product } from '@njiani/shared';

const BUSINESS_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '+254700000000';

export function WhatsAppButton({ product }: { product: Product }) {
  function handleWhatsApp() {
    const url = buildWhatsAppOrderUrl(
      BUSINESS_PHONE,
      [{ productId: product.id, productName: product.name, price: product.price, quantity: 1 }],
      'Valued Customer',
    );
    window.open(url, '_blank', 'noopener');
  }

  return (
    <button
      onClick={handleWhatsApp}
      className="flex items-center justify-center gap-2 bg-[var(--color-whatsapp)] hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors min-h-[48px]"
    >
      <MessageCircle className="w-5 h-5" />
      Order via WhatsApp
    </button>
  );
}
