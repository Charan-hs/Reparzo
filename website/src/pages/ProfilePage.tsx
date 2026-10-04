import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Plus, 
  Trash2, 
  Home, 
  Briefcase, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  LogOut, 
  Edit3, 
  X, 
  Check, 
  Wrench, 
  Package, 
  HelpCircle, 
  MessageSquare,
  Building,
  RotateCcw,
  ShoppingBag,
  FileText,
  Lock,
  UserCheck
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getOrderTypeDetails } from '../lib/orderType';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { 
    user, 
    updateUserProfile, 
    logout, 
    setAuthModalOpen, 
    savedAddresses, 
    deleteAddress, 
    setDefaultAddress, 
    selectSavedAddress,
    setAddressModalOpen, 
    orders,
    location,
    addToCart,
    setCartDrawerOpen
  } = useAppStore();

  // Active tab state: 'bookings' | 'addresses' | 'info'
  const activeTab = (searchParams.get('tab') as 'bookings' | 'addresses' | 'info') || 'bookings';

  const setActiveTab = (tab: 'bookings' | 'addresses' | 'info') => {
    setSearchParams({ tab });
  };

  // Profile Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  // Safe date formatting helper to prevent 'Invalid Date'
  const formatOrderDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return dateStr;
  };

  // Bookings filter - default to active live repairs
  const [bookingFilter, setBookingFilter] = useState<'all' | 'active' | 'completed'>('active');

  const openEditProfile = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setEditName(user.name);
    setEditPhone(user.phone);
    setEditEmail(user.email || '');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    updateUserProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim() || undefined,
    });
    setIsEditModalOpen(false);
    toast.success('Profile details updated successfully');
  };

  // Filter bookings for user
  const filteredOrders = orders.filter((order) => {
    if (bookingFilter === 'active') {
      return order.status === 'in_progress' || order.status === 'technician_assigned' || order.status === 'confirmed';
    }
    if (bookingFilter === 'completed') {
      return order.status === 'completed';
    }
    return true;
  });

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'in_progress' || o.status === 'technician_assigned' || o.status === 'confirmed'
  ).length;

  const handleReorder = (order: typeof orders[0]) => {
    order.items.forEach((item) => {
      addToCart(item.service);
    });
    setCartDrawerOpen(true);
    toast.success(`Added ${order.items.length} services to cart`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 sm:pb-16 pt-3 sm:pt-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">

        {/* ── Breadcrumb / Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-[#2563EB] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">My Account & Profile</span>
          </div>

          {user && (
            <button
              onClick={() => {
                logout();
                toast.success('Logged out successfully');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}
        </div>

        {/* ── User Overview Hero Card ────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-sm p-5 sm:p-7">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-100/40 via-indigo-50/20 to-transparent rounded-full blur-3xl -z-0 pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-md border-2 border-white">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-full h-full object-cover rounded-2xl" 
                    />
                  ) : (
                    <span>{(user?.name || 'Guest User').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                {user && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Active">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {user?.name || 'Guest Customer'}
                  </h1>
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200/80">
                    {user?.role === 'admin' 
                      ? 'Admin' 
                      : user?.role === 'partner' 
                      ? 'Verified Partner' 
                      : 'Verified Customer'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {user?.phone || 'No phone linked'}
                  </span>
                  {user?.email && (
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {user.email}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    {location.area || 'Bengaluru'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              {user ? (
                <button
                  onClick={openEditProfile}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 border border-slate-200"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Login / Register</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Total Bookings</span>
              <span className="text-xl font-black text-slate-900 font-mono">{orders.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Saved Addresses</span>
              <span className="text-xl font-black text-[#2563EB] font-mono">{savedAddresses.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Active Repairs</span>
              <span className="text-xl font-black text-amber-600 font-mono">{activeOrdersCount}</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-800 block">Reparzo Shield</span>
              <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1 mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Reparzo Assured
              </span>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ─────────────────────────────────────── */}
        <div className="flex border-b border-slate-200 space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Service Bookings</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'addresses'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Doorstep Addresses</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
              {savedAddresses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Guarantees & Support</span>
          </button>
        </div>

        {/* ── Tab 1: Service Bookings & Orders ───────────────────── */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {/* Filter pills */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <button
                  onClick={() => setBookingFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    bookingFilter === 'all'
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({orders.length})
                </button>
                <button
                  onClick={() => setBookingFilter('active')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    bookingFilter === 'active'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active ({activeOrdersCount})
                </button>
                <button
                  onClick={() => setBookingFilter('completed')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    bookingFilter === 'completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Completed ({orders.filter((o) => o.status === 'completed').length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/bookings"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-bold transition-all border border-blue-200"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Live Dispatch View ➔</span>
                </Link>
                <button
                  onClick={() => navigate('/services')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Book New Service</span>
                </button>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">No Service Bookings Found</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                    {bookingFilter === 'active'
                      ? 'You currently have no active repairs or technician dispatches.'
                      : 'You have not booked any repair services yet. Book our certified experts for doorstep repairs.'}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/services')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <span>Explore Services Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const isActive = order.status === 'in_progress' || order.status === 'technician_assigned' || order.status === 'confirmed';
                  const orderMeta = getOrderTypeDetails(order.items);
                  
                  return (
                    <div 
                      key={order.id}
                      className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden hover:border-slate-300 transition-all"
                    >
                      {/* Card Header */}
                      <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-black text-xs font-mono">
                            #
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black font-mono text-slate-900">{order.id}</span>
                              <span className="text-[11px] text-slate-400">•</span>
                              <span className="text-xs font-medium text-slate-500">
                                {formatOrderDate(order.createdAt)}
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-[#2563EB]" />
                              {order.slot.dateLabel} • {order.slot.timeSlot}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {order.status === 'in_progress' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                              Order Underway
                            </span>
                          )}
                          {order.status === 'technician_assigned' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
                              <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping" />
                              {order.technicianName ? orderMeta.step2 : orderMeta.partnerPendingTitle}
                            </span>
                          )}
                          {order.status === 'confirmed' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                              Confirmed
                            </span>
                          )}
                          {order.status === 'completed' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Service Completed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 sm:p-5 space-y-4">
                        {/* Services List */}
                        <div className="divide-y divide-slate-100">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                  {item.service.image ? (
                                    <img 
                                      src={item.service.image} 
                                      alt={item.service.title} 
                                      className="w-full h-full object-cover" 
                                    />
                                  ) : (
                                    <Wrench className="w-5 h-5 text-slate-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                    {item.service.title}
                                  </h4>
                                  <span className="text-[11px] text-slate-500 font-medium">
                                    Qty: {item.quantity} • ₹{item.service.price} each
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 flex-shrink-0">
                                ₹{item.service.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Doorstep Address & Technician Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/80 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Doorstep Service Address
                            </span>
                            <div className="flex items-start gap-1.5 text-xs text-slate-700">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-2 leading-relaxed">{order.address}</span>
                            </div>
                          </div>

                          {order.technicianName ? (
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/80 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                {orderMeta.partnerRoleTitle}
                              </span>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold truncate">
                                  <UserCheck className="w-3.5 h-3.5 text-[#2563EB] flex-shrink-0" />
                                  <span className="truncate">{order.technicianName}</span>
                                </div>
                                {order.technicianPhone && (
                                  <a
                                    href={`tel:${order.technicianPhone}`}
                                    className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-100 transition-colors inline-flex items-center gap-1 flex-shrink-0"
                                  >
                                    <Phone className="w-3 h-3 text-[#2563EB]" />
                                    Call
                                  </a>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100/80 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                {orderMeta.partnerPendingTitle}
                              </span>
                              <p className="text-[11px] text-slate-500 leading-snug">
                                {orderMeta.partnerPendingSubtitle}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Bottom Total & Actions */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div>
                              <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                                Grand Total Paid
                              </span>
                              <span className="text-base sm:text-lg font-black font-mono text-slate-900">
                                ₹{order.grandTotal}
                              </span>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                              order.paymentStatus === 'paid' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {order.paymentMethod === 'cash' ? 'PAY AFTER SERVICE / DELIVERY' : order.paymentMethod.toUpperCase()} • {order.paymentStatus.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReorder(order)}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                            >
                              <RotateCcw className="w-3 h-3 text-[#2563EB]" />
                              <span>Book Again</span>
                            </button>
                            <button
                              onClick={() => {
                                toast.info(`Live tracking for ${order.id}: Technician is on schedule.`);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                            >
                              <span>{isActive ? 'Track Live' : 'View Invoice'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 2: Saved Doorstep Addresses ────────────────────── */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Your Saved Doorstep Locations ({savedAddresses.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Save addresses for 1-click doorstep repair bookings and instant technician dispatch.
                </p>
              </div>

              <button
                onClick={() => setAddressModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            {savedAddresses.length === 0 ? (
              <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
                  <Building className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">No Saved Addresses Added Yet</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                    You have not added any doorstep delivery addresses. Add your Home, Office, or Workshop on our interactive map.
                  </p>
                </div>
                <button
                  onClick={() => setAddressModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Doorstep Address to Map</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedAddresses.map((addr) => {
                  const isCurrentLocation = location.area === addr.area && location.fullAddress === addr.fullAddress;
                  const Icon = addr.label === 'Home' ? Home : addr.label === 'Work' ? Briefcase : MapPin;

                  return (
                    <div 
                      key={addr.id}
                      className={`p-5 rounded-3xl bg-white border transition-all space-y-3 relative ${
                        addr.isDefault 
                          ? 'border-[#2563EB] ring-2 ring-blue-500/10 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            addr.label === 'Home' 
                              ? 'bg-blue-50 text-[#2563EB]' 
                              : addr.label === 'Work' 
                              ? 'bg-indigo-50 text-indigo-600' 
                              : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-slate-900">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              Default
                            </span>
                          )}
                        </div>

                        {/* Delete Address */}
                        <button
                          onClick={() => {
                            deleteAddress(addr.id);
                            toast.success(`Removed "${addr.label}" address`);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        {addr.flatNumber && (
                          <p className="font-bold text-slate-800">{addr.flatNumber}</p>
                        )}
                        <p className="line-clamp-2 leading-relaxed text-slate-600">{addr.fullAddress}</p>
                        {addr.landmark && (
                          <p className="text-[11px] text-slate-400">Landmark: {addr.landmark}</p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        {!addr.isDefault ? (
                          <button
                            onClick={() => {
                              setDefaultAddress(addr.id);
                              toast.success(`Set "${addr.label}" as default address`);
                            }}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          >
                            Set as Default
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Primary Delivery Address
                          </span>
                        )}

                        <button
                          onClick={() => {
                            selectSavedAddress(addr.id);
                            toast.success(`Active delivery location set to "${addr.label}" (${addr.area})`);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isCurrentLocation
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 hover:bg-[#2563EB] hover:text-white text-slate-700'
                          }`}
                        >
                          {isCurrentLocation ? '✓ Selected' : 'Deliver Here'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 3: Reparzo Shield & Guarantees & Support ───────── */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Guarantees Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Upfront Transparent Pricing</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every service price and spare part cost is approved by you upfront before work begins. Zero hidden charges or surprise invoices.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">100% Genuine Spare Parts</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We use verified OEM grade components with transparent MRP pricing and verified part serial numbers for maximum durability.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Background-Verified Pros</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every technician undergoes multi-point police verification, technical assessment, and skill certification before joining Reparzo.
                </p>
              </div>
            </div>

            {/* Direct Support Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-blue-200">
                      24x7 Customer Assistance
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black">Need Help with a Booking or Repair?</h3>
                  <p className="text-xs text-blue-100/80 max-w-lg">
                    Our dedicated support team is available around the clock to assist you with order rescheduling, technician tracking, or technical questions.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="https://wa.me/916362000263?text=Hi%20Reparzo,%20I%20need%20assistance%20with%20my%20booking"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Chat</span>
                  </a>
                  <a
                    href="tel:+916362000263"
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all border border-white/20"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Helpline</span>
                  </a>
                  <Link
                    to="/contact"
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all border border-white/20"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Help Desk</span>
                  </Link>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-blue-200/80 gap-2">
                <span>Helpline: +91 6362000263</span>
                <span>Email: Contact@reparzo.com</span>
                <span>Operating Hub: Davangere, Karnataka, India</span>
              </div>
            </div>

            {/* Legal & Compliance Quick Bar */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Reparzo Legal & Governance</h4>
                <p className="text-xs text-slate-500">Review terms of service, customer & partner guidelines, and Indian DPDP data protection policies.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/terms"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#2563EB] hover:text-white text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Terms & Conditions</span>
                </Link>
                <Link
                  to="/privacy"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#2563EB] hover:text-white text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Privacy Policy</span>
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Edit Profile Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="text-sm font-bold text-slate-900">Edit Profile Details</h3>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 98450 XXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
