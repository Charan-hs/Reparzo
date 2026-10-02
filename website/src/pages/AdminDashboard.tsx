import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  TrendingUp, 
  Users, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Sparkles, 
  Wrench, 
  Search, 
  Filter, 
  Plus, 
  ArrowUpRight, 
  ExternalLink, 
  RefreshCw, 
  Phone, 
  MapPin, 
  ChevronRight,
  Sliders,
  Check,
  Power
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../store/useAppStore';
import type { OrderBooking } from '../types';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    user, 
    orders, 
    updateOrderStatus, 
    categories, 
    services, 
    setCategoryManagerOpen,
    setAuthModalOpen 
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'categories' | 'partners'>('bookings');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [surgeActive, setSurgeActive] = useState(false);

  // If user is not admin, show permission gate
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#080D1A] flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-[#E32402] border border-rose-500/30 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
            <Shield className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white">Admin Privileges Required</h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              This executive operations portal is restricted to Reparzo System Administrators. Please log in with admin credentials.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-left text-xs text-slate-300">
            <span className="font-bold text-white block mb-0.5">Demo Admin Credentials:</span>
            <span>Mobile: <strong className="text-rose-400 font-mono">99999 99999</strong> (Auto-detected as Admin)</span>
          </div>

          <button
            onClick={() => setAuthModalOpen(true, 'admin')}
            className="w-full py-3.5 rounded-2xl bg-[#E32402] hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
          >
            Open Unified Login Screen ➔
          </button>

          <Link
            to="/"
            className="inline-block text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Return to Customer Storefront
          </Link>
        </div>
      </div>
    );
  }

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleAdvanceStatus = (order: OrderBooking) => {
    let nextStatus: OrderBooking['status'] = 'completed';
    if (order.status === 'confirmed') nextStatus = 'technician_assigned';
    else if (order.status === 'technician_assigned') nextStatus = 'in_progress';
    else if (order.status === 'in_progress') nextStatus = 'completed';

    updateOrderStatus(order.id, nextStatus);
    toast.success(`Order ${order.id} status updated to: ${nextStatus.replace('_', ' ').toUpperCase()}`);
  };

  const handleToggleSurge = () => {
    setSurgeActive(!surgeActive);
    toast.info(!surgeActive ? 'Rain / High-Demand Surge Pricing (+15%) enabled across Bengaluru' : 'Surge Pricing deactivated');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24">
      {/* ── Top Executive Ribbon ──────────────────────── */}
      <div className="bg-[#0B132B] text-white border-b border-slate-800 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-md bg-[#E32402] text-white font-extrabold uppercase text-[10px] tracking-widest shadow-xs">
              SuperAdmin
            </span>
            <span className="font-bold text-slate-200">
              Reparzo Central Operations Hub • Bengaluru Metropolitan Grid
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Cloudflare D1 & Worker Active
            </span>
            <span className="text-slate-600">|</span>
            <Link to="/" className="text-slate-300 hover:text-white flex items-center gap-1">
              <span>View Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <span className="text-slate-600">|</span>
            <Link to="/partner" className="text-amber-400 hover:text-amber-300 flex items-center gap-1">
              <span>Partner Board</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        {/* ── Header Title & Quick Control Strip ────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Executive Admin Control</span>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md">
                v2.4
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage real-time dispatch, pricing catalog, fleet partners, and service categories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleToggleSurge}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                surgeActive 
                  ? 'bg-amber-500 text-white shadow-amber-500/20' 
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>Surge Pricing: {surgeActive ? 'ON (+15%)' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setCategoryManagerOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#E32402] hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Manage Categories</span>
            </button>
          </div>
        </div>

        {/* ── KPI Metric Cards ──────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
          {/* Revenue */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold">Total Gross Revenue</span>
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +18.4%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900">
              ₹3,84,250
            </div>
            <p className="text-[11px] text-slate-400 mt-1">₹42,800 platform commission</p>
          </div>

          {/* Active Orders */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold">Live Active Orders</span>
              <span className="text-blue-600 font-bold">24 Active</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-[#2563EB]">
              {orders.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {orders.filter(o => o.status === 'in_progress').length} In Progress • {orders.filter(o => o.status === 'confirmed').length} Dispatched
            </p>
          </div>

          {/* Fleet Partners */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold">Active Fleet</span>
              <span className="text-amber-600 font-bold">56 Online</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-amber-500">
              56 / 62
            </div>
            <p className="text-[11px] text-slate-400 mt-1">94% Fleet Utilization Rate</p>
          </div>

          {/* Response Time & SLA */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold">Avg Arrival SLA</span>
              <span className="text-emerald-600 font-bold">99.2%</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-600">
              21 mins
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Across 8 Bangalore Zones</p>
          </div>
        </div>

        {/* ── Operational Navigation Tabs ───────────────── */}
        <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Live Bookings Dispatch ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'services'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Services & Pricing Catalog ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'categories'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories CMS ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('partners')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'partners'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Partner Fleet Roster (3 Active)</span>
          </button>
        </div>

        {/* ── TAB 1: Live Bookings Dispatch ─────────────── */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Order ID, name, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {['all', 'confirmed', 'technician_assigned', 'in_progress', 'completed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap capitalize ${
                      statusFilter === st
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings Table / Cards */}
            <div className="grid grid-cols-1 gap-3.5">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                  <Clock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-bold">No bookings found matching current filter</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-slate-900">
                          {order.id}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            order.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : order.status === 'in_progress'
                              ? 'bg-blue-50 text-[#2563EB] border border-blue-200 animate-pulse'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          ● {order.status.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Slot: {order.slot.timeSlot}
                        </span>
                      </div>

                      <div className="text-sm font-bold text-slate-800">
                        {order.items.map((i) => `${i.quantity}x ${i.service.title}`).join(', ')}
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                        <span>Customer: <strong>{order.customerName}</strong> ({order.customerPhone})</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500" /> {order.address}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 flex items-center gap-2 pt-1">
                        <span className="font-semibold text-slate-700">Assigned Partner:</span>
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold text-[11px] border border-amber-200 flex items-center gap-1">
                          <Wrench className="w-3 h-3" /> {order.technicianName}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <div className="text-right">
                        <div className="text-xl font-mono font-black text-slate-900">
                          ₹{order.grandTotal}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-emerald-600">
                          {order.paymentStatus === 'paid' ? 'PAID (UPI)' : 'PAY ON SERVICE'}
                        </span>
                      </div>

                      {order.status !== 'completed' && (
                        <button
                          onClick={() => handleAdvanceStatus(order)}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#2563EB] text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
                        >
                          {order.status === 'confirmed' && 'Assign Partner ➔'}
                          {order.status === 'technician_assigned' && 'Mark In-Progress ➔'}
                          {order.status === 'in_progress' && 'Mark Completed ✓'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: Services & Pricing Catalog ─────────── */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Service Price Book</h3>
                <p className="text-xs text-slate-500">Live pricing served to customer cart and checkout</p>
              </div>
              <span className="text-xs font-mono font-bold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-lg">
                {services.length} Services Listed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#2563EB]">
                        {service.categoryTitle}
                      </span>
                      {service.isPopular && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-50 text-[#E32402]">
                          Popular
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{service.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{service.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-lg font-mono font-black text-slate-900">₹{service.price}</span>
                      <span className="text-xs font-mono text-slate-400 line-through ml-1.5">₹{service.originalPrice}</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600">{service.warrantyDays}-Day Warranty</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: Categories CMS ─────────────────────── */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Service Categories CMS</h3>
                <p className="text-xs text-slate-500">Control active visibility, promotional badges, and sort order</p>
              </div>
              <button
                onClick={() => setCategoryManagerOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#E32402] hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Open Full Category Editor</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{cat.title}</span>
                      <span className={`w-2 h-2 rounded-full ${cat.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{cat.description}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>Order: #{cat.order}</span>
                    <span className="text-[#2563EB]">{cat.badge || 'Standard'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: Partner Fleet Roster ───────────────── */}
        {activeTab === 'partners' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Verified Technician Network</h3>
                <p className="text-xs text-slate-500">Manage partner availability, daily wallet settlements, and ratings</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                All 3 Partners KYC Verified ✓
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Partner 1 */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                    alt="Sunil Gowda"
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Sunil Gowda</h4>
                    <span className="text-[11px] text-emerald-600 font-bold block">● ONLINE (Receiving Jobs)</span>
                    <span className="text-[10px] text-slate-400 font-mono">98765 43210</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Today</span>
                    <span className="font-mono font-bold text-slate-900">₹1,420</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Rating</span>
                    <span className="font-mono font-bold text-amber-500">4.92 ★</span>
                  </div>
                </div>

                <button
                  onClick={() => toast.success('Instant bank payout of ₹1,420 credited to Sunil Gowda')}
                  className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                >
                  Settle Today's Payout ➔
                </button>
              </div>

              {/* Partner 2 */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                    alt="Rajesh Kumar"
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Rajesh Kumar</h4>
                    <span className="text-[11px] text-emerald-600 font-bold block">● ONLINE (Bike Specialist)</span>
                    <span className="text-[10px] text-slate-400 font-mono">98444 55667</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Today</span>
                    <span className="font-mono font-bold text-slate-900">₹1,150</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Rating</span>
                    <span className="font-mono font-bold text-amber-500">4.88 ★</span>
                  </div>
                </div>

                <button
                  onClick={() => toast.success('Instant bank payout of ₹1,150 credited to Rajesh Kumar')}
                  className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                >
                  Settle Today's Payout ➔
                </button>
              </div>

              {/* Partner 3 */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
                    alt="Anand Kumar"
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Anand Kumar</h4>
                    <span className="text-[11px] text-amber-600 font-bold block">● BUSY (On Job #8492)</span>
                    <span className="text-[10px] text-slate-400 font-mono">91111 11111</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Today</span>
                    <span className="font-mono font-bold text-slate-900">₹980</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Rating</span>
                    <span className="font-mono font-bold text-amber-500">4.85 ★</span>
                  </div>
                </div>

                <button
                  onClick={() => toast.success('Instant bank payout of ₹980 credited to Anand Kumar')}
                  className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                >
                  Settle Today's Payout ➔
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
