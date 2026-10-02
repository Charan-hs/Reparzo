import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Search, 
  ShoppingCart, 
  User, 
  ChevronDown, 
  Sparkles, 
  Shield, 
  Wrench, 
  LogOut, 
  Layers,
  Menu,
  X,
  Zap
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const ROTATING_SEARCH_HINTS = [
  'Search "AC Foam Jet Deep Clean"',
  'Search "Doorstep Bike Servicing @ ₹199"',
  'Search "Short Circuit & MCB Tripping"',
  'Search "Tap & Concealed Pipe Leak"',
  'Search "1 BHK Home Shifting & Movers"',
  'Search "Refrigerator Cooling Repair"',
];

export const Navbar: React.FC = () => {
  const { 
    location, 
    setLocationModalOpen, 
    setSearchOpen, 
    cart, 
    getCartMetrics, 
    setCartDrawerOpen,
    user,
    activeRole,
    setActiveRole,
    setAuthModalOpen,
    logout,
    setCategoryManagerOpen
  } = useAppStore();

  const [hintIndex, setHintIndex] = useState(0);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const routerLocation = useLocation();
  const navigate = useNavigate();

  const { totalItems, subtotal } = getCartMetrics();

  // Rotate search hint every 3.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % ROTATING_SEARCH_HINTS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'All Services', href: '/services' },
    { label: 'System Health', href: '/health' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-xs transition-all">
      {/* ── Top Micro-Announcement Strip ──────────────── */}
      <div className="bg-[#0E1B4D] border-b border-[#142563] text-[11px] py-1 px-4 text-center font-medium text-slate-300 hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#E32402] text-white">
              ⚡ Live Fast Service
            </span>
            <span>Technicians available right now • Average Doorstep Arrival: <strong className="text-white">18–25 mins</strong></span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Cloudflare Edge Active
            </span>
            <span className="text-slate-600">|</span>
            {user?.role === 'admin' ? (
              <button
                onClick={() => setCategoryManagerOpen(true)}
                className="text-cyan-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-3 h-3" /> Admin CMS
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true, 'partner')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Become a Partner / Technician
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Navigation Row ────────────────────────── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Brand Logo & Location Selector */}
        <div className="flex items-center gap-2.5 sm:gap-6 flex-shrink-0">
          {/* Logo with official Reparzo image */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="Reparzo"
              className="h-7 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Blinkit-Style Location Pill */}
          <button
            onClick={() => setLocationModalOpen(true)}
            className="flex flex-col text-left py-1 px-2.5 sm:px-3 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#2563EB] uppercase tracking-wider">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{location.etaMinutes} Mins Doorstep</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-800 group-hover:text-[#2563EB] transition-colors">
              <span className="truncate max-w-[105px] sm:max-w-[160px]">{location.area}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors flex-shrink-0" />
            </div>
          </button>
        </div>

        {/* Center: Full-Screen Trigger Search Bar (Blinkit Style) */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div
            onClick={() => setSearchOpen(true)}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#2563EB] transition-all flex items-center justify-between cursor-pointer group shadow-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Search className="w-4 h-4 text-[#2563EB] group-hover:scale-110 transition-transform flex-shrink-0" />
              <div className="relative h-5 overflow-hidden flex items-center">
                <span className="text-sm text-slate-500 group-hover:text-slate-800 transition-colors truncate">
                  {ROTATING_SEARCH_HINTS[hintIndex]}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <kbd className="hidden lg:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-md">
                Full Screen
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Actions: Navigation Links, Role Switcher, Cart */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 mr-1">
            {navLinks.map((link) => {
              const isActive = routerLocation.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-50 text-[#2563EB] border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Search Icon button to trigger Full Screen search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 active:scale-95 cursor-pointer"
            aria-label="Open search"
          >
            <Search className="w-4 h-4 text-[#2563EB]" />
          </button>

          {/* User Account / Unified Multi-Role Access */}
          <div className="relative">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-xl object-cover border border-slate-300"
                  />
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-bold text-slate-800 block leading-tight">{user.name.split(' ')[0]}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${user.role === 'admin' ? 'text-[#E32402]' : user.role === 'partner' ? 'text-amber-600' : 'text-[#2563EB]'}`}>
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown for role navigation & logout */}
                {roleMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-900 block">{user.name}</span>
                      <span className="text-[11px] text-slate-500 block">{user.phone}</span>
                    </div>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setRoleMenuOpen(false);
                          setCategoryManagerOpen(true);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#E32402]" />
                        <span>Manage Categories</span>
                      </button>
                    )}

                    {user.role === 'partner' && (
                      <Link
                        to="/partner"
                        onClick={() => setRoleMenuOpen(false)}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Wrench className="w-3.5 h-3.5 text-amber-500" />
                        <span>Partner Jobs Board</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    {/* Switch Role Quick Tester */}
                    <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Role Mode
                    </div>
                    {(['user', 'partner', 'admin'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setActiveRole(r);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full px-4 py-1.5 text-left text-xs flex items-center justify-between cursor-pointer ${activeRole === r ? 'text-[#2563EB] font-bold bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className="capitalize">{r === 'user' ? 'Customer' : r}</span>
                        {activeRole === r && <span className="text-[10px]">● Active</span>}
                      </button>
                    ))}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setRoleMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true, 'user')}
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-[#0E1B4D] hover:bg-[#16255c] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-cyan-300" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Blinkit-Style Cart Trigger Button */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            className={`py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs ${
              totalItems > 0
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20'
                : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#E32402] text-white text-[10px] font-mono font-bold flex items-center justify-center animate-bounce">
                  {totalItems}
                </span>
              )}
            </div>

            <div className="text-left leading-tight hidden xs:block">
              {totalItems > 0 ? (
                <>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider block opacity-90">
                    {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
                  </span>
                  <span className="text-xs font-mono font-extrabold text-white">
                    ₹{subtotal}
                  </span>
                </>
              ) : (
                <span className="text-xs font-semibold">Cart</span>
              )}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
