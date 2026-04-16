'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Minus, Plus, Trash2, Loader2, MessageCircle, Mail, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart';
import { useCreateOrder } from '@/lib/hooks';
import { buildWhatsAppOrderUrl, formatPrice } from '@njiani/shared';

const BUSINESS_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '+254700000000';

interface CheckoutFormValues {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerLocation: string;
  notes: string;
}

export default function CartPage() {
  const router = useRouter();
  const { items, totalAmount, updateQuantity, removeItem, clearCart } = useCartStore();
  const createOrder = useCreateOrder();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<CheckoutFormValues>();

  async function submitOrder(channel: 'WHATSAPP' | 'EMAIL') {
    const values = getValues();

    if (items.length === 0) return;

    try {
      const order = await createOrder.mutateAsync({
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerEmail: values.customerEmail || undefined,
        customerLocation: values.customerLocation || undefined,
        notes: values.notes || undefined,
        channel,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });

      // If WhatsApp, also open the chat
      if (channel === 'WHATSAPP') {
        const url = buildWhatsAppOrderUrl(BUSINESS_PHONE, items, values.customerName);
        window.open(url, '_blank', 'noopener');
      }

      clearCart();
      router.push(`/order/success?ref=${order.referenceNumber}`);
    } catch {
      // Error is shown via mutation.isError
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold text-[var(--color-primary)] mb-2">Your cart is empty</h1>
        <p className="text-[var(--color-muted)] mb-6">Add some products to get started.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-red-600 text-white font-medium py-2.5 px-6 rounded-xl transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-bold text-[var(--color-primary)] mb-8">Your Cart</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: items + form */}
        <div className="md:col-span-2 space-y-6">
          {/* Cart items */}
          <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm divide-y divide-[var(--color-border)]">
            {items.map((item) => (
              <div key={item.productId} className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-primary)] truncate">{item.productName}</p>
                  <p className="text-sm text-[var(--color-muted)]">{formatPrice(item.price)} each</p>
                </div>

                {/* Quantity stepper */}
                <div className="flex items-center border border-[var(--color-border)] rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-sm font-medium min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="font-semibold w-24 text-right">{formatPrice(item.price * item.quantity)}</p>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Customer form */}
          <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6">
            <h2 className="font-semibold text-lg text-[var(--color-primary)] mb-4">Your Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    {...register('customerName', { required: 'Name is required' })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    placeholder="e.g. John Doe"
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    {...register('customerPhone', {
                      required: 'Phone is required',
                      pattern: {
                        value: /^(\+254|0)[17]\d{8}$/,
                        message: 'Enter a valid Kenyan phone number',
                      },
                    })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    placeholder="+254712345678"
                  />
                  {errors.customerPhone && (
                    <p className="text-red-500 text-xs mt-1">{errors.customerPhone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  {...register('customerEmail')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Location (optional)
                </label>
                <input
                  {...register('customerLocation')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  placeholder="e.g. Westlands, Nairobi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  rows={2}
                  {...register('notes')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  placeholder="Any special requests…"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: summary + CTAs */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6 sticky top-20">
            <h2 className="font-semibold text-lg text-[var(--color-primary)] mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-[var(--color-muted)] truncate mr-2">
                    {item.productName} ×{item.quantity}
                  </span>
                  <span className="font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold text-lg pt-4 border-t border-[var(--color-border)]">
              <span>Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>

            {createOrder.isError && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                {createOrder.error instanceof Error
                  ? createOrder.error.message
                  : 'Order failed. Please try again.'}
              </div>
            )}

            {/* WhatsApp CTA */}
            <button
              onClick={handleSubmit(() => submitOrder('WHATSAPP'))}
              disabled={createOrder.isPending}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-[var(--color-whatsapp)] hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px]"
            >
              {createOrder.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <MessageCircle className="w-5 h-5" />
              )}
              Send via WhatsApp
            </button>

            {/* Email CTA */}
            <button
              onClick={handleSubmit(() => submitOrder('EMAIL'))}
              disabled={createOrder.isPending}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {createOrder.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              Send via Email
            </button>

            <p className="text-xs text-[var(--color-muted)] text-center mt-3">
              We&apos;ll confirm availability and delivery details with you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
