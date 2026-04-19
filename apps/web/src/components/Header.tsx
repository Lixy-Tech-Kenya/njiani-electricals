import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart, selectItemCount } from '@/lib/stores/cart';

export default function Header() {
  const itemCount = useCart(selectItemCount);
  const sync = useCart((s) => s.sync);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { sync(); }, [sync]);

  // Close menu on route change (link click)
  function closeMenu() { setMenuOpen(false); }

  return (
    <header className="sticky top-0 z-50 bg-primary text-white shadow-md">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-tight" onClick={closeMenu}>
          Njiani Electricals
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6">
          <NavLink to="/products" className={({ isActive }) => `hover:text-accent transition-colors ${isActive ? 'text-accent' : ''}`}>
            Products
          </NavLink>
          <Link to="/cart" className="relative group">
            <span className="flex items-center gap-1.5 hover:text-accent transition-colors">
              <ShoppingCart size={18} />
              <span>Cart</span>
            </span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-accent text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile: cart icon + hamburger */}
        <div className="flex sm:hidden items-center gap-3">
          <Link to="/cart" className="relative p-1" onClick={closeMenu}>
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="sm:hidden bg-primary border-t border-white/10 px-4 pb-4 space-y-1">
          <NavLink
            to="/products"
            onClick={closeMenu}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
            }
          >
            Products
          </NavLink>
          <NavLink
            to="/cart"
            onClick={closeMenu}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
            }
          >
            <ShoppingCart size={16} />
            Cart {itemCount > 0 && `(${itemCount})`}
          </NavLink>
        </div>
      )}
    </header>
  );
}
