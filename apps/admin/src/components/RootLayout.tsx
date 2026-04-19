import { Outlet, NavLink, useNavigate } from 'react-router';
import { LayoutDashboard, ShoppingBag, Package, Tag, LogOut } from 'lucide-react';
import { api } from '@/lib/api/client';

const navItems = [
  { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
  { to: '/products', icon: <Package size={18} />, label: 'Products' },
  { to: '/categories', icon: <Tag size={18} />, label: 'Categories' },
];

export default function RootLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    await api.auth.logout().catch(() => {});
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-primary text-white flex flex-col">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <h1 className="text-lg font-bold tracking-tight">Njiani Admin</h1>
          <p className="text-xs text-white/50 mt-0.5">Management Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-grow px-3 py-4 space-y-1">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-grow flex flex-col min-w-0">
        <main className="flex-grow p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
