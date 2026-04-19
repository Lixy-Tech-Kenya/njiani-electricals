import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ShoppingCart, Trash2, ArrowLeft, MessageCircle, Mail, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '@/lib/api/client';
import { useCart, selectTotalAmount } from '@/lib/stores/cart';

export default function CartPage() {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const totalAmount = useCart(selectTotalAmount);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const clear = useCart((s) => s.clear);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submitOrder(channel: 'WHATSAPP' | 'EMAIL') {
    if (!customerName || !customerPhone) {
      setError('Name and Phone are required');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const order = await api.orders.create({
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        customerLocation: customerLocation || undefined,
        notes: notes || undefined,
        channel,
        idempotencyKey: uuidv4(),
        items: items.map((i) => ({ productId: i.product!.id, quantity: i.quantity })),
      });

      if (channel === 'WHATSAPP') {
        const itemList = items.map((i) => `• ${i.product!.name} (x${i.quantity})`).join('\n');
        const message = encodeURIComponent(
          `Hello Njiani Electricals, I'd like to place an order:\n\n${itemList}\n\n` +
          `Total: KES ${(totalAmount / 100).toLocaleString()}\n` +
          `Reference: ${order.referenceNumber}\n\n` +
          `My name: ${customerName}\n\nPlease confirm availability. Thank you.`
        );
        window.open(`https://wa.me/254746079183?text=${message}`, '_blank');
      }

      await clear();
      navigate('/order/success?ref=' + order.referenceNumber);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8 md:mb-12">
        <Link to="/products" className="bg-white p-2 rounded-lg shadow-sm hover:text-accent transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">Your Cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 md:p-16 text-center shadow-sm max-w-2xl mx-auto">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5 text-gray-400">
            <ShoppingCart size={32} className="md:hidden" />
            <ShoppingCart size={40} className="hidden md:block" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-3">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-8">Looks like you haven't added any electrical products yet.</p>
          <Link to="/products" className="bg-primary hover:bg-accent text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/10 inline-block">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {items.map((item) => (
              <div key={item.product?.id} className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-3 md:gap-6 items-center">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                  <img src={item.product?.imageUrls[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-sm md:text-lg truncate mb-0.5 md:mb-1">{item.product?.name}</h3>
                  <p className="text-xs text-gray-400 mb-2 md:mb-3">{item.product?.category?.name}</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-accent text-sm md:text-base">
                      KES {((item.product?.price ?? 0) / 100).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 md:gap-4">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-9 md:h-10">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2.5 md:px-3 h-full hover:bg-gray-100 transition-colors text-lg leading-none"
                        >-</button>
                        <span className="w-8 md:w-10 text-center font-bold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2.5 md:px-3 h-full hover:bg-gray-100 transition-colors text-lg leading-none"
                        >+</button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 size={16} className="md:hidden" />
                        <Trash2 size={18} className="hidden md:block" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Form */}
          <aside className="w-full">
            <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100 lg:sticky lg:top-24">
              <h2 className="text-lg md:text-xl font-bold mb-5 md:mb-6">Order Details</h2>

              <div className="space-y-4 mb-6 md:mb-8">
                {[
                  { id: 'name', label: 'Full Name *', type: 'text', value: customerName, onChange: setCustomerName, placeholder: 'Enter your name' },
                  { id: 'phone', label: 'Phone Number *', type: 'tel', value: customerPhone, onChange: setCustomerPhone, placeholder: 'e.g. 0700 000 000' },
                  { id: 'email', label: 'Email (Optional)', type: 'email', value: customerEmail, onChange: setCustomerEmail, placeholder: 'your@email.com' },
                  { id: 'location', label: 'Delivery Location (Optional)', type: 'text', value: customerLocation, onChange: setCustomerLocation, placeholder: 'e.g. Westlands, Nairobi' },
                ].map(({ id, label, type, value, onChange, placeholder }) => (
                  <div key={id}>
                    <label htmlFor={id} className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">{label}</label>
                    <input
                      type={type} id={id} value={value}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder={placeholder}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:border-accent outline-none transition-all text-base"
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Notes</label>
                  <textarea
                    id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                    placeholder="Any specific instructions?"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-accent outline-none transition-all text-base resize-none"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5 mb-6 md:mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500 text-sm">Subtotal</span>
                  <span className="font-medium text-gray-700">KES {(totalAmount / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg md:text-xl font-bold">Total</span>
                  <span className="text-lg md:text-xl font-bold text-primary">KES {(totalAmount / 100).toLocaleString()}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm mb-5">
                  <span className="font-bold">Error:</span> {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => submitOrder('WHATSAPP')}
                  disabled={isSubmitting}
                  className="w-full bg-whatsapp hover:bg-whatsapp/90 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-whatsapp/10 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <MessageCircle size={20} />}
                  Order via WhatsApp
                </button>
                <button
                  onClick={() => submitOrder('EMAIL')}
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Mail size={20} />}
                  Order via Email
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-4">
                By placing an order, you agree to our Terms &amp; Conditions.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
