import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Calendar, User, ShoppingBag } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const BottomNav: React.FC = () => {
  const routerLocation = useLocation();
  const { getCartMetrics, setCartDrawerOpen, setAuthModalOpen, user } = useAppStore();
  const { totalItems, subtotal } = getCartMetrics();

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Services', icon: Grid, path: '/services' },
    { label: 'Bookings', icon: Calendar, path: '/checkout' },
    { 
      label: user ? user.name.split(' ')[0] : 'Account', 
      icon: User, 
      action: () => (user ? null : setAuthModalOpen(true, 'user')) 
    },
  ];

  return (
    <>
      {/* ── Floating Quick Cart Bar on Mobile (when cart has items) ── */}
      {totalItems > 0 && routerLocation.pathname !== '/checkout' && routerLocation.pathname !== '/cart' && (
        <div className="fixed bottom-18 left-3 right-3 z-30 sm:hidden">
          <div 
            onClick={() => setCartDrawerOpen(true)}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-[#2563EB] text-white shadow-2xl flex items-center justify-between cursor-pointer border border-white/20 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block text-emerald-100">
                  {totalItems} {totalItems === 1 ? 'Service' : 'Services'} Selected
                </span>
                <span className="text-sm font-mono font-extrabold text-white">
                  ₹{subtotal} + Taxes
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider bg-white/20 px-3 py-1.5 rounded-xl">
              <span>View Cart ➔</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Fixed Bottom Navigation Dock in Light Mode ──────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-2 sm:hidden pb-safe">
        <div className="grid grid-cols-4 items-center">
          {navItems.map((item, idx) => {
            const isActive = routerLocation.pathname === item.path;
            const Icon = item.icon;

            if (item.action) {
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
                    isActive ? 'text-[#2563EB]' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold mt-1">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1 transition-all ${
                  isActive ? 'text-[#2563EB]' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
