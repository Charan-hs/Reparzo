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
  Calendar,
  HelpCircle
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
    setCategoryManagerOpen,
    setCustomRequestModalOpen
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
            <span>Doorstep service active • Working Hours: <strong className="text-white">10:00 AM – 06:00 PM</strong></span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live in Davangere
            </span>
            <span className="text-slate-600">|</span>
            {user?.role === 'admin' ? (
              <Link
                to="/admin"
                className="text-rose-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
              >
                <Shield className="w-3 h-3 text-[#E32402]" /> Admin Dashboard
              </Link>
            ) : user?.role === 'partner' ? (
              <Link
                to="/partner"
                className="text-amber-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
              >
                <Wrench className="w-3 h-3 text-amber-400" /> Partner Jobs Board
              </Link>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Become a Partner / Technician
              </button>
            )}
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setCustomRequestModalOpen(true)}
              className="text-amber-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3 h-3 text-amber-400" /> Custom / Parcel / Meat
            </button>
            <span className="text-slate-600">|</span>
            <Link
              to="/contact"
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3 h-3 text-blue-400" /> Help & Contact
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Navigation Row ────────────────────────── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Brand Logo & Location Selector (Stacked Blinkit-Style) */}
        <div className="flex flex-col items-start justify-center flex-shrink-0">
          {/* Logo with official Reparzo image */}
          <Link to="/" className="flex items-center group">
            <img
              src="/logo.png"
              alt="Reparzo"
              className="h-5 sm:h-7.5 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Location Picker directly below the logo */}
          <button
            onClick={() => setLocationModalOpen(true)}
            className="flex items-center gap-1 mt-0.5 text-left cursor-pointer group max-w-[130px] sm:max-w-[240px]"
            title="Change service location"
          >
            <MapPin className={`w-3 h-3 flex-shrink-0 group-hover:scale-110 transition-transform ${
              location.isServiceable === false ? 'text-amber-500' : 'text-[#2563EB]'
            }`} />
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-[#2563EB] transition-colors truncate">
              {location.addressLabel && location.addressLabel !== 'Hub' && location.addressLabel !== 'GPS'
                ? `${location.addressLabel}: ${location.area}`
                : location.area}
            </span>
            {location.isServiceable === false && (
              <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 flex-shrink-0 border border-amber-200">
                Coming Soon
              </span>
            )}
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-700 flex-shrink-0 transition-colors" />
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
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
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

          {/* Custom Request Trigger Button */}
          <button
            onClick={() => setCustomRequestModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Request meat delivery, parcels, couriers, or custom tasks"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden xl:inline">+ Custom Request</span>
            <span className="xl:hidden">+ Custom</span>
          </button>

          {/* Mobile Custom Request Trigger */}
          <button
            onClick={() => setCustomRequestModalOpen(true)}
            className="md:hidden p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 active:scale-95 cursor-pointer"
            aria-label="Open custom request"
            title="Custom Request"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </button>

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
                {/* Role-Specific Quick Action Pill */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#E32402] border border-rose-200 text-xs font-bold transition-all shadow-xs"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Portal</span>
                  </Link>
                )}

                {user.role === 'partner' && (
                  <Link
                    to="/partner"
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition-all shadow-xs"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Jobs Board</span>
                  </Link>
                )}

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
                {/* Dropdown for role navigation & logout */}
                {roleMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-900 block truncate">{user.name}</span>
                      <span className="text-[11px] text-slate-500 block font-mono">{user.phone || user.email}</span>
                      {user.role === 'admin' && (
                        <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-50 text-[#E32402] border border-rose-200">
                          Administrator
                        </span>
                      )}
                      {user.role === 'partner' && (
                        <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          Service Partner
                        </span>
                      )}
                    </div>

                    {/* Direct Role Dashboard Links */}
                    <div className="py-1">
                      {user.role === 'admin' && (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setRoleMenuOpen(false)}
                            className="w-full px-4 py-2 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Shield className="w-3.5 h-3.5 text-[#E32402]" />
                            <span>Executive Admin Dashboard</span>
                          </Link>
                          <button
                            onClick={() => {
                              setRoleMenuOpen(false);
                              setCategoryManagerOpen(true);
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Layers className="w-3.5 h-3.5 text-[#E32402]" />
                            <span>Manage Categories CMS</span>
                          </button>
                        </>
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

                      <Link
                        to="/profile"
                        onClick={() => setRoleMenuOpen(false)}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>My Profile & Account</span>
                      </Link>

                      <Link
                        to="/bookings"
                        onClick={() => setRoleMenuOpen(false)}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>My Bookings & Orders</span>
                      </Link>

                      <Link
                        to="/profile?tab=addresses"
                        onClick={() => setRoleMenuOpen(false)}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Saved Addresses</span>
                      </Link>

                      <Link
                        to="/bookings?tab=custom"
                        onClick={() => setRoleMenuOpen(false)}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-indigo-700 hover:bg-indigo-50 flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>My Custom Requests</span>
                      </Link>

                      <Link
                        to="/contact"
                        onClick={() => setRoleMenuOpen(false)}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span>Help Desk & Contact</span>
                      </Link>
                    </div>

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
                onClick={() => setAuthModalOpen(true)}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-white flex-shrink-0" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Blinkit-Style Cart Trigger Button */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            className={`p-2 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs ${
              totalItems > 0
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20'
                : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200/70'
            }`}
            aria-label="View Cart"
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
