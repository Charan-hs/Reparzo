import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Wrench, 
  ShieldCheck, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  ChevronRight, 
  ShoppingBag, 
  AlertCircle, 
  User, 
  Sparkles,
  HelpCircle,
  FileText,
  KeyRound,
  MessageSquare,
  Sun,
  Moon,
  Info,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../store/useAppStore';
import { OrderBooking } from '../types';
import { 
  getOrderWorkingSchedule, 
  formatNumericDate, 
  formatShortDate, 
  REPARZO_WORKING_HOURS 
} from '../lib/workingHours';

export const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    orders, 
    user, 
    setAuthModalOpen, 
    addToCart, 
    setCartDrawerOpen 
  } = useAppStore();

  // URL query parameter support: /bookings?view=previous or default to 'live'
  const initialView = searchParams.get('view') === 'previous' ? 'previous' : 'live';
  const [activeTab, setActiveTab] = useState<'live' | 'previous'>(initialView);
  const [scheduleInfoModalOrder, setScheduleInfoModalOrder] = useState<OrderBooking | null>(null);
  const [expandedScheduleOrderId, setExpandedScheduleOrderId] = useState<string | null>(null);

  const handleTabChange = (tab: 'live' | 'previous') => {
    setActiveTab(tab);
    setSearchParams(tab === 'previous' ? { view: 'previous' } : {});
  };

  // Live active orders: confirmed, technician_assigned, in_progress
  const liveOrders = orders.filter(
    (o) => o.status === 'in_progress' || o.status === 'technician_assigned' || o.status === 'confirmed'
  );

  // Past completed orders
  const previousOrders = orders.filter((o) => o.status === 'completed');

  // Safe date formatting helper to completely prevent 'Invalid Date' and show numeric dates
  const formatOrderDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return formatNumericDate(parsed);
    }
    return dateStr;
  };

  const handleReorder = (order: OrderBooking) => {
    order.items.forEach((item) => {
      addToCart(item.service);
    });
    setCartDrawerOpen(true);
    toast.success(`Added ${order.items.length} services to cart`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 sm:pb-16 pt-3 sm:pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">

        {/* ── Breadcrumb & Top Links ───────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-[#2563EB] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">My Bookings</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Account Settings</span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Need Help?</span>
            </Link>
          </div>
        </div>

        {/* ── Focused Bookings Header Banner ───────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E1B4D] via-[#1E3A8A] to-[#2563EB] text-white p-6 sm:p-8 shadow-xl border border-blue-900/40">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/20 text-blue-200">
                <Calendar className="w-3.5 h-3.5 text-blue-300" />
                <span>Doorstep Service Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                My Service Bookings
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
                Track live technician arrival, view completion PINs, and manage past doorstep repair history.
              </p>
            </div>

            {/* Live Status Badge Indicator */}
            <div className="flex-shrink-0">
              {liveOrders.length > 0 ? (
                <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-center sm:text-right">
                  <div className="flex items-center justify-center sm:justify-end gap-2 text-xs font-bold text-emerald-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>{liveOrders.length} {liveOrders.length === 1 ? 'Live Booking Active' : 'Live Bookings Active'}</span>
                  </div>
                  <span className="text-[11px] text-blue-200 block mt-0.5 font-medium">
                    Technician on schedule
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-white/10 border border-white/15 text-center sm:text-right">
                  <span className="text-xs font-bold text-blue-200 block">All Caught Up</span>
                  <span className="text-[11px] text-blue-300/80 block">No pending doorstep repairs</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Primary Live vs Previous Segmented Tabs ──────────────── */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-1">
          <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
            <button
              onClick={() => handleTabChange('live')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                liveOrders.length > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'
              }`} />
              <span>Live Bookings</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'live' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {liveOrders.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('previous')}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'previous'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Previous Bookings</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'previous' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {previousOrders.length}
              </span>
            </button>
          </div>

          <button
            onClick={() => navigate('/services')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <span>+ Book New Service</span>
          </button>
        </div>

        {/* ── View 1: LIVE BOOKINGS (Default View) ─────────────────── */}
        {activeTab === 'live' && (
          <div className="space-y-4">
            {liveOrders.length === 0 ? (
              /* Empty state for Live Bookings */
              <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
                  <Wrench className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">No Live Bookings Right Now</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    You do not have any ongoing repairs or active technician dispatches in progress.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => navigate('/services')}
                    className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Book a Doorstep Repair</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {previousOrders.length > 0 && (
                    <button
                      onClick={() => handleTabChange('previous')}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>View Previous Bookings ({previousOrders.length})</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* List of Live Active Orders */
              <div className="space-y-5">
                {liveOrders.map((order) => {
                  const completionPin = order.completionPin || order.id.replace(/\D/g, '').slice(-4) || '1234';
                  const schedule = getOrderWorkingSchedule(order);

                  return (
                    <div 
                      key={order.id}
                      className="rounded-3xl bg-white border-2 border-blue-500/30 shadow-md overflow-hidden transition-all"
                    >
                      {/* Live Status Header Banner */}
                      <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border-b border-blue-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-black text-sm font-mono shadow-xs">
                            #
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-black font-mono text-slate-900">{order.id}</span>
                              <span className="text-[11px] text-slate-400">•</span>
                              <span className="text-xs font-bold text-slate-600">
                                Booked {formatOrderDate(order.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                                <span>Service Window: <strong className="text-slate-900">{schedule.targetDateNumeric}</strong> • {REPARZO_WORKING_HOURS.label}</span>
                              </span>
                              
                              {/* (i) Schedule Info Button */}
                              <button
                                type="button"
                                onClick={() => setScheduleInfoModalOrder(order)}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-blue-200 text-[11px] font-bold transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                title="Click to view working hours & visit schedule info"
                              >
                                <Info className="w-3 h-3 text-[#2563EB]" />
                                <span>Schedule Info</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Real-time Status Badges & Schedule Pill (i) */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Interactive (i) Schedule Status Pill */}
                          <button
                            type="button"
                            onClick={() => setScheduleInfoModalOrder(order)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95 ${
                              schedule.statusBadgeVariant === 'active-today'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                : schedule.statusBadgeVariant === 'outside-hours'
                                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                : 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100'
                            }`}
                            title="Click to view working hours details (i)"
                          >
                            {schedule.statusBadgeVariant === 'outside-hours' ? (
                              <Moon className="w-3.5 h-3.5 text-amber-600" />
                            ) : (
                              <Sun className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            <span>{schedule.statusBadgeText}</span>
                            <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center font-serif italic text-[10px] font-black">
                              i
                            </span>
                          </button>

                          {order.status === 'in_progress' && (
                            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500 text-white text-xs font-extrabold shadow-xs">
                              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                              Repair In Progress
                            </span>
                          )}
                          {order.status === 'technician_assigned' && (
                            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2563EB] text-white text-xs font-extrabold shadow-xs">
                              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                              Technician Assigned
                            </span>
                          )}
                          {order.status === 'confirmed' && (
                            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-extrabold shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              Booking Confirmed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Optional Inline Expanded Schedule Banner (when toggled) */}
                      {expandedScheduleOrderId === order.id && (
                        <div className={`px-5 py-3.5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in ${
                          schedule.statusBadgeVariant === 'active-today'
                            ? 'bg-emerald-50/70 border-emerald-100 text-emerald-950'
                            : schedule.statusBadgeVariant === 'outside-hours'
                            ? 'bg-amber-50/70 border-amber-100 text-amber-950'
                            : 'bg-blue-50/70 border-blue-100 text-blue-950'
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              schedule.statusBadgeVariant === 'active-today'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : schedule.statusBadgeVariant === 'outside-hours'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-[#2563EB] text-white shadow-xs'
                            }`}>
                              {schedule.statusBadgeVariant === 'outside-hours' ? (
                                <Moon className="w-4 h-4" />
                              ) : (
                                <Sun className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-extrabold">
                                  {schedule.scheduleTitle}
                                </h4>
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                  schedule.statusBadgeVariant === 'active-today'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : schedule.statusBadgeVariant === 'outside-hours'
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : 'bg-blue-100 text-blue-800 border-blue-300'
                                }`}>
                                  {schedule.statusBadgeText}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed font-medium">
                                {schedule.scheduleSubtitle}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 flex-shrink-0">
                            <div className="sm:text-right">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                                Standard Working Hours
                              </span>
                              <span className="text-xs font-mono font-bold text-slate-900">
                                {REPARZO_WORKING_HOURS.label}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setExpandedScheduleOrderId(null)}
                              className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                            >
                              Hide info ▲
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Live Dispatch Stepper Tracker (No more 'Arriving in 18-25m') */}
                      <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-100">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold mb-1 shadow-2xs">
                              ✓
                            </div>
                            <span className="text-[11px] font-bold text-slate-900">Confirmed</span>
                            <span className="text-[10px] text-slate-400">Order Placed</span>
                          </div>

                          <div className="flex flex-col items-center relative">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 shadow-2xs ${
                              order.status === 'technician_assigned' || order.status === 'in_progress'
                                ? 'bg-[#2563EB] text-white ring-4 ring-blue-100'
                                : 'bg-slate-200 text-slate-500'
                            }`}>
                              {order.status === 'in_progress' ? '✓' : '2'}
                            </div>
                            <span className="text-[11px] font-bold text-slate-900">Service Window</span>
                            <span className="text-[10px] text-slate-600 font-semibold">{schedule.stepperSubtext}</span>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                              order.status === 'in_progress'
                                ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                                : 'bg-slate-200 text-slate-400'
                            }`}>
                              3
                            </div>
                            <span className="text-[11px] font-bold text-slate-900">Doorstep Fix</span>
                            <span className="text-[10px] text-slate-500">
                              {order.status === 'in_progress' ? 'Underway Now' : 'Inspection & Fix'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-4">
                        
                        {/* Services List */}
                        <div className="divide-y divide-slate-100">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
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
                                    Quantity: {item.quantity} • ₹{item.service.price} each
                                  </span>
                                </div>
                              </div>
                              <span className="text-sm font-mono font-bold text-slate-900 flex-shrink-0">
                                ₹{item.service.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Assigned Partner & Doorstep Location Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                          
                          {/* Technician Card */}
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                              Assigned Service Technician
                            </span>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-xs flex-shrink-0">
                                  RG
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-xs font-bold text-slate-900 truncate">
                                    {order.technicianName}
                                  </h5>
                                  <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Background Verified
                                  </span>
                                </div>
                              </div>

                              <a
                                href={`tel:${order.technicianPhone || '+916362000263'}`}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs transition-colors flex-shrink-0 cursor-pointer"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Call</span>
                              </a>
                            </div>
                          </div>

                          {/* Delivery Address */}
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                              Doorstep Service Address
                            </span>
                            <div className="flex items-start gap-1.5 text-xs text-slate-700">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-2 leading-relaxed font-medium">{order.address}</span>
                            </div>
                          </div>

                        </div>

                        {/* Customer 4-Digit Completion PIN Highlight */}
                        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                              <KeyRound className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 block">
                                Service Completion PIN
                              </span>
                              <span className="text-xs text-amber-800">
                                Share this PIN with your technician only after physical work is completed.
                              </span>
                            </div>
                          </div>

                          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 font-mono font-black text-base text-amber-900 tracking-widest text-center shadow-2xs">
                            {completionPin}
                          </div>
                        </div>

                        {/* Bottom Total & Support Actions */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div>
                              <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                                Grand Total Payable
                              </span>
                              <span className="text-lg sm:text-xl font-black font-mono text-slate-900">
                                ₹{order.grandTotal}
                              </span>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                              order.paymentStatus === 'paid' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {order.paymentMethod.toUpperCase()} • {order.paymentStatus.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href="https://wa.me/916362000263?text=Hi%20Reparzo,%20I%20need%20assistance%20with%20booking"
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Support</span>
                            </a>
                            <button
                              onClick={() => {
                                toast.info(`${order.id}: ${schedule.scheduleTitle} (${schedule.targetDateNumeric}) during working hours (10:00 AM – 06:00 PM)`);
                              }}
                              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            >
                              <span>Refresh Status</span>
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

        {/* ── View 2: PREVIOUS / PAST BOOKINGS ─────────────────────── */}
        {activeTab === 'previous' && (
          <div className="space-y-4">
            {previousOrders.length === 0 ? (
              /* Empty state for Previous Bookings */
              <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <RotateCcw className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">No Previous Bookings Yet</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                    Once your doorstep repair services are completed, your past invoices and reorder shortcuts will appear here.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/services')}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                >
                  Explore Services Catalog
                </button>
              </div>
            ) : (
              /* List of Previous Orders */
              <div className="space-y-4">
                {previousOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden hover:border-slate-300 transition-all"
                  >
                    {/* Header */}
                    <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs font-mono">
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
                          <span className="text-[11px] text-slate-500">
                            Delivered to: {order.address.split(',')[0]}
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Service Completed • PIN Verified
                      </span>
                    </div>

                    {/* Services Items */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="divide-y divide-slate-100">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="font-bold text-slate-900 truncate">{item.service.title}</span>
                              <span className="text-[11px] text-slate-500">Qty: {item.quantity}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-900">
                              ₹{item.service.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 block font-semibold">Total Paid</span>
                          <span className="text-base font-black font-mono text-slate-900">₹{order.grandTotal}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReorder(order)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#2563EB] hover:text-white text-slate-800 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 border border-slate-200"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Book Again</span>
                          </button>
                          <button
                            onClick={() => {
                              toast.success(`Tax Invoice for ${order.id} ready.`);
                            }}
                            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200"
                          >
                            Download Invoice
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Working Hours & Visit Policy Modal (i) ─────────────── */}
        {scheduleInfoModalOrder && (() => {
          const schedule = getOrderWorkingSchedule(scheduleInfoModalOrder);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
              <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Working Hours & Visit Schedule
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Booking #{scheduleInfoModalOrder.id}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setScheduleInfoModalOrder(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* The Exact Card from Screenshot */}
                <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  schedule.statusBadgeVariant === 'active-today'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : schedule.statusBadgeVariant === 'outside-hours'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                    : 'bg-blue-50/80 border-blue-200 text-blue-950'
                }`}>
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      schedule.statusBadgeVariant === 'active-today'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : schedule.statusBadgeVariant === 'outside-hours'
                        ? 'bg-[#d97706] text-white shadow-xs'
                        : 'bg-[#2563EB] text-white shadow-xs'
                    }`}>
                      {schedule.statusBadgeVariant === 'outside-hours' ? (
                        <Moon className="w-5 h-5" />
                      ) : (
                        <Sun className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {schedule.scheduleTitle}
                      </h4>
                      <div>
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border inline-block ${
                          schedule.statusBadgeVariant === 'active-today'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : schedule.statusBadgeVariant === 'outside-hours'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}>
                          {schedule.statusBadgeText}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium pt-1">
                        {schedule.scheduleSubtitle}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-200/60">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Standard Working Hours
                    </span>
                    <span className="text-sm font-mono font-black text-slate-900">
                      {REPARZO_WORKING_HOURS.label}
                    </span>
                  </div>
                </div>

                {/* Transparency & Policy Explanation */}
                <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <h5 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Reparzo Working Hours Policy
                  </h5>
                  <ul className="space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563EB] font-bold">•</span>
                      <span><strong>Verified Daytime Visits:</strong> Reparzo technicians only conduct doorstep repairs between 10:00 AM and 06:00 PM for precision diagnostics and customer safety.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563EB] font-bold">•</span>
                      <span><strong>Genuine Spare Parts:</strong> Components and testing tools are dispatched live from our regional parts hubs during operating hours.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2563EB] font-bold">•</span>
                      <span><strong>Doorstep Verification PIN:</strong> Hold your 4-digit PIN and share it only after the technician finishes physical work.</span>
                    </li>
                  </ul>
                </div>

                {/* Close Button */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setScheduleInfoModalOrder(null)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-[#2563EB] text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    Got it, Understood ✓
                  </button>
                </div>

              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
};
