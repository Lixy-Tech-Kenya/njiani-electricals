import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import { LayoutDashboard, ShoppingBag, Package, Tag, LogOut, Menu, X } from 'lucide-react';
import { api } from '@/lib/api/client';

const navItems = [
  { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
  { to: '/products', icon: <Package size={18} />, label: 'Products' },
  { to: '/categories', icon: <Tag size={18} />, label: 'Categories' },
];

export default function RootLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await api.auth.logout().catch(() => {});
    navigate('/login');
  }

  function closeMenu() { setSidebarOpen(false); }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Njiani Admin</h1>
          <p className="text-xs text-white/50 mt-0.5">Management Panel</p>
        </div>
        <button
          onClick={closeMenu}
          className="md:hidden p-1 rounded-lg hover:bg-white/10 transition-colors text-white/60"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-grow px-3 py-4 space-y-1">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={closeMenu}
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
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-primary text-white flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={closeMenu} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-primary text-white flex flex-col shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 bg-primary text-white px-4 py-3 shadow-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <span className="font-bold text-base">Njiani Admin</span>
        </div>

        <main className="flex-grow p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
