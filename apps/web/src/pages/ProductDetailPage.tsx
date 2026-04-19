import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { ShoppingCart, MessageCircle, ChevronRight, CheckCircle2, X, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '@/lib/api/client';
import { useCart } from '@/lib/stores/cart';
import type { Product } from '@njiani/shared';

// ── Quick-order modal ────────────────────────────────────────────────────────
interface QuickOrderModalProps {
  product: Product;
  quantity: number;
  onClose: () => void;
}

function QuickOrderModal({ product, quantity, onClose }: QuickOrderModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleOrder() {
    if (!name.trim() || !phone.trim()) {
      setError('Name and phone number are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const order = await api.orders.create({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        channel: 'WHATSAPP',
        idempotencyKey: uuidv4(),
        items: [{ productId: product.id, quantity }],
      });

      const message = encodeURIComponent(
        `Hello Njiani Electricals, I'd like to order:\n\n` +
        `• ${product.name} (x${quantity})\n\n` +
        `Total: KES ${((product.price * quantity) / 100).toLocaleString()}\n` +
        `Reference: ${order.referenceNumber}\n\n` +
        `My name: ${name.trim()}\n\nPlease confirm availability. Thank you.`
      );
      window.open(`https://wa.me/254746079183?text=${message}`, '_blank');
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 z-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-1">Quick Order via WhatsApp</h2>
        <p className="text-sm text-gray-500 mb-6">
          <span className="font-medium text-gray-700">{product.name}</span> × {quantity} &mdash;&nbsp;
          KES {((product.price * quantity) / 100).toLocaleString()}
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-accent outline-none transition-all"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Phone Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 0700 000 000"
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-accent outline-none transition-all"
              onKeyDown={e => e.key === 'Enter' && handleOrder()}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
        )}

        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full bg-whatsapp hover:bg-whatsapp/90 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-whatsapp/10 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <MessageCircle size={20} />}
          {loading ? 'Placing order…' : 'Continue to WhatsApp'}
        </button>
        <p className="text-[10px] text-gray-400 text-center mt-3">
          Your order will be recorded and confirmed via WhatsApp.
        </p>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const addItem = useCart((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showQuickOrder, setShowQuickOrder] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['products', slug],
    queryFn: () => api.products.bySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl aspect-square"></div>
          <div className="space-y-6">
            <div className="h-8 bg-white rounded w-3/4"></div>
            <div className="h-4 bg-white rounded w-1/4"></div>
            <div className="h-32 bg-white rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link to="/" className="hover:text-accent">Home</Link>
          <ChevronRight size={14} />
          <Link to="/products" className="hover:text-accent">Products</Link>
          <ChevronRight size={14} />
          <span className="text-gray-600 truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm aspect-square border border-gray-100">
              <img src={product.imageUrls[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.imageUrls.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.imageUrls.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === i ? 'border-accent shadow-md' : 'border-transparent opacity-60'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center gap-3">
              <span className="bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                {product.category?.name}
              </span>
              {product.status === 'ACTIVE' && (
                <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                  <CheckCircle2 size={14} /> In Stock
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{product.name}</h1>
            <p className="text-sm text-gray-400 mb-6">SKU: {product.sku}</p>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
              <p className="text-4xl font-bold text-primary mb-6">
                <span className="text-lg font-medium text-gray-400 mr-1 text-sm uppercase tracking-tighter">KES</span>
                {(product.price / 100).toLocaleString()}
              </p>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-200 transition-colors"
                  >-</button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-200 transition-colors"
                  >+</button>
                </div>
                <p className="text-xs text-gray-400 font-medium">Available: {product.stockQuantity} units</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => addItem(product, quantity)}
                  disabled={product.status !== 'ACTIVE'}
                  className="flex-grow bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/10"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button
                  onClick={() => setShowQuickOrder(true)}
                  disabled={product.status !== 'ACTIVE'}
                  className="flex-grow bg-whatsapp hover:bg-whatsapp/90 disabled:bg-gray-300 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-whatsapp/10"
                >
                  <MessageCircle size={20} />
                  Order on WhatsApp
                </button>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-gray-600 border-t border-gray-100 pt-8">
              <h3 className="text-primary font-bold text-lg mb-4">Description</h3>
              <div className="whitespace-pre-line leading-relaxed">{product.description}</div>
            </div>
          </div>
        </div>
      </div>

      {showQuickOrder && (
        <QuickOrderModal
          product={product}
          quantity={quantity}
          onClose={() => setShowQuickOrder(false)}
        />
      )}
    </>
  );
}
