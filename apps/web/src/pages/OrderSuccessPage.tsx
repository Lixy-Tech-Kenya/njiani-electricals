import { Link, useSearchParams } from 'react-router';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref') || 'NJE-XXXX';

  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={48} />
        </div>

        <h1 className="text-4xl font-bold mb-4 tracking-tight text-primary">Order Placed Successfully!</h1>
        <p className="text-gray-500 mb-8 text-lg">
          Thank you for shopping with Njiani Electricals. Your order has been received and is being processed.
        </p>

        <div className="bg-gray-50 p-6 rounded-2xl mb-10 inline-block border border-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Order Reference</p>
          <p className="text-2xl font-mono font-bold text-primary">{ref}</p>
        </div>

        <div className="space-y-4 max-w-sm mx-auto">
          <p className="text-sm text-gray-400">
            What's next? If you chose WhatsApp, we've opened a chat with our team. If you chose Email, check your inbox for confirmation. We will contact you soon for delivery details.
          </p>

          <div className="pt-8 flex flex-col gap-4">
            <Link
              to="/products"
              className="bg-primary hover:bg-accent text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/10"
            >
              <ShoppingBag size={20} />
              Continue Shopping
            </Link>
            <Link
              to="/"
              className="text-gray-400 hover:text-primary font-bold flex items-center justify-center gap-2 transition-colors"
            >
              Back to Home
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
