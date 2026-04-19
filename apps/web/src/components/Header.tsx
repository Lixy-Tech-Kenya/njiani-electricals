import { useEffect } from 'react';
import { Link } from 'react-router';
import { useCart, selectItemCount } from '@/lib/stores/cart';

export default function Header() {
  const itemCount = useCart(selectItemCount);
  const sync = useCart((s) => s.sync);

  useEffect(() => {
    sync();
  }, [sync]);

  return (
    <header className="sticky top-0 z-50 bg-primary text-white shadow-md">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          Njiani Electricals
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/products" className="hover:text-accent transition-colors">
            Products
          </Link>
          <Link to="/cart" className="relative group">
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-accent text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center border border-primary">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
