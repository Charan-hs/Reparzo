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
  Radio,
  Power,
  Edit3,
  Trash2,
  X,
  Calendar,
  RotateCcw,
  KeyRound,
  Package,
  Navigation,
  Send,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../store/useAppStore';
import type { OrderBooking, CustomRequest, CustomRequestStatus } from '../types';
import { AdminGeoCoverageTab } from '../components/admin/AdminGeoCoverageTab';
import { 
  getOrderWorkingSchedule, 
  formatNumericDate, 
  formatShortDate, 
  REPARZO_WORKING_HOURS 
} from '../lib/workingHours';
import { INITIAL_SERVICES } from '../data/fallbackCatalog';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    user, 
    orders, 
    addOrder,
    updateOrderStatus, 
    updateOrder,
    deleteOrder,
    resetOrdersToDefault,
    customRequests,
    updateCustomRequestStatus,
    updateCustomRequest,
    deleteCustomRequest,
    resetCustomRequestsToDefault,
    categories, 
    services, 
    serviceHubs,
    setCategoryManagerOpen,
    setCustomRequestModalOpen,
    setAuthModalOpen 
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'bookings' | 'custom_requests' | 'services' | 'categories' | 'partners' | 'coverage'>('bookings');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [surgeActive, setSurgeActive] = useState(false);

  // Custom Requests Tab state
  const [customStatusFilter, setCustomStatusFilter] = useState<string>('all');
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [quoteInputs, setQuoteInputs] = useState<Record<string, string>>({});
  const [partnerInputs, setPartnerInputs] = useState<Record<string, { name: string; phone: string }>>({});
  const [adminNotesInputs, setAdminNotesInputs] = useState<Record<string, string>>({});


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

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm(`Are you sure you want to delete booking ${orderId}? This removes it from live tracking.`)) {
      deleteOrder(orderId);
      toast.success(`Booking ${orderId} deleted.`);
    }
  };

  // ── Edit Booking State ────────────────────────────────
  const [editingOrder, setEditingOrder] = useState<OrderBooking | null>(null);
  const [editForm, setEditForm] = useState<{
    status: OrderBooking['status'];
    technicianName: string;
    technicianPhone: string;
    scheduledDate: string;
    timeSlot: string;
    customerName: string;
    customerPhone: string;
    address: string;
    grandTotal: number;
    paymentStatus: 'paid' | 'pending';
    adminNotes: string;
    completionPin: string;
  }>({
    status: 'confirmed',
    technicianName: '',
    technicianPhone: '',
    scheduledDate: '',
    timeSlot: 'Working Hours (10:00 AM - 06:00 PM)',
    customerName: '',
    customerPhone: '',
    address: '',
    grandTotal: 0,
    paymentStatus: 'paid',
    adminNotes: '',
    completionPin: '8492',
  });

  const handleOpenEdit = (order: OrderBooking) => {
    setEditingOrder(order);
    const existingDate = order.slot?.scheduledDate ? order.slot.scheduledDate.slice(0, 10) : new Date().toISOString().slice(0, 10);
    setEditForm({
      status: order.status,
      technicianName: order.technicianName || '',
      technicianPhone: order.technicianPhone || '',
      scheduledDate: existingDate,
      timeSlot: order.slot?.timeSlot || 'Working Hours (10:00 AM - 06:00 PM)',
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      address: order.address || '',
      grandTotal: order.grandTotal || 0,
      paymentStatus: order.paymentStatus || 'paid',
      adminNotes: order.adminNotes || '',
      completionPin: order.completionPin || order.id.replace(/\D/g, '').slice(-4) || '1234',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const parsedDate = new Date(editForm.scheduledDate);
    const formattedDateNumeric = !isNaN(parsedDate.getTime()) ? formatNumericDate(parsedDate) : editForm.scheduledDate;

    updateOrder(editingOrder.id, {
      status: editForm.status,
      technicianName: editForm.technicianName,
      technicianPhone: editForm.technicianPhone,
      customerName: editForm.customerName,
      customerPhone: editForm.customerPhone,
      address: editForm.address,
      grandTotal: Number(editForm.grandTotal),
      paymentStatus: editForm.paymentStatus,
      adminNotes: editForm.adminNotes,
      completionPin: editForm.completionPin,
      slot: {
        ...editingOrder.slot,
        timeSlot: editForm.timeSlot,
        dateLabel: formattedDateNumeric,
        scheduledDate: editForm.scheduledDate,
      },
    });

    toast.success(`Booking ${editingOrder.id} successfully updated! Live changes applied.`);
    setEditingOrder(null);
  };

  // ── Create Booking State ──────────────────────────────
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    technicianName: 'Ramesh Gowda (Certified Master Technician)',
    technicianPhone: '+91 98450 88219',
    scheduledDate: new Date().toISOString().slice(0, 10),
    timeSlot: 'Working Hours (10:00 AM - 06:00 PM)',
    grandTotal: 499,
    status: 'confirmed' as OrderBooking['status'],
    completionPin: Math.floor(1000 + Math.random() * 9000).toString(),
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.customerName.trim() || !createForm.customerPhone.trim() || !createForm.address.trim()) {
      toast.error('Please enter customer name, phone, and address');
      return;
    }

    const parsedDate = new Date(createForm.scheduledDate);
    const formattedDate = !isNaN(parsedDate.getTime()) ? formatNumericDate(parsedDate) : createForm.scheduledDate;

    const newOrder: OrderBooking = {
      id: `RPZ-${Math.floor(100000 + Math.random() * 900000)}`,
      items: [
        {
          service: services[0] || INITIAL_SERVICES[0],
          quantity: 1,
        }
      ],
      itemTotal: Number(createForm.grandTotal),
      platformFee: 19,
      discount: 0,
      grandTotal: Number(createForm.grandTotal),
      address: createForm.address,
      customerName: createForm.customerName,
      customerPhone: createForm.customerPhone.startsWith('+91') ? createForm.customerPhone : `+91 ${createForm.customerPhone}`,
      slot: {
        type: 'scheduled',
        dateLabel: formattedDate,
        timeSlot: createForm.timeSlot,
        scheduledDate: createForm.scheduledDate,
      },
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      status: createForm.status,
      createdAt: new Date().toISOString(),
      technicianName: createForm.technicianName,
      technicianPhone: createForm.technicianPhone,
      completionPin: createForm.completionPin || Math.floor(1000 + Math.random() * 9000).toString(),
    };

    addOrder(newOrder);
    toast.success(`Booking ${newOrder.id} created successfully! PIN: ${newOrder.completionPin}`);
    setIsCreateModalOpen(false);
    setCreateForm({
      customerName: '',
      customerPhone: '',
      address: '',
      technicianName: 'Ramesh Gowda (Certified Master Technician)',
      technicianPhone: '+91 98450 88219',
      scheduledDate: new Date().toISOString().slice(0, 10),
      timeSlot: 'Working Hours (10:00 AM - 06:00 PM)',
      grandTotal: 499,
      status: 'confirmed',
      completionPin: Math.floor(1000 + Math.random() * 9000).toString(),
    });
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
              System Operational
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
            onClick={() => setActiveTab('custom_requests')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'custom_requests'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Custom & Unique Requests ({customRequests.length})</span>
            {customRequests.filter(r => r.status === 'submitted' || r.status === 'under_review').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold animate-pulse">
                {customRequests.filter(r => r.status === 'submitted' || r.status === 'under_review').length} New
              </span>
            )}
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

          <button
            onClick={() => setActiveTab('coverage')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'coverage'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Geo Hubs & Coverage ({serviceHubs.length})</span>
          </button>
        </div>

        {/* ── TAB 1: Live Bookings Dispatch ─────────────── */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {/* Filter, Search, and Action Bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by ID, name, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {['all', 'confirmed', 'technician_assigned', 'in_progress', 'completed', 'cancelled'].map((st) => (
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

              {/* Action Buttons: New Booking & Reset Demo */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-[#2563EB] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer whitespace-nowrap active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Booking</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Reset bookings to initial default dataset?')) {
                      resetOrdersToDefault();
                      toast.success('Bookings reset to default demo dataset');
                    }
                  }}
                  title="Reset Demo Dataset"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
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
                filteredOrders.map((order) => {
                  const schedule = getOrderWorkingSchedule(order);

                  return (
                    <div
                      key={order.id}
                      className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
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
                                : order.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            ● {order.status.replace('_', ' ')}
                          </span>

                          {/* Dynamic Working Schedule Badge */}
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${
                            schedule.statusBadgeVariant === 'active-today'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : schedule.statusBadgeVariant === 'outside-hours'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {schedule.targetDateNumeric} • {REPARZO_WORKING_HOURS.label}
                          </span>

                          {/* Service Completion PIN Badge */}
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                            <KeyRound className="w-3 h-3 text-amber-600" />
                            PIN: {order.completionPin || order.id.replace(/\D/g, '').slice(-4) || '1234'}
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

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-700">Assigned Partner:</span>
                            <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md font-bold text-[11px] border border-amber-200 flex items-center gap-1">
                              <Wrench className="w-3 h-3 text-amber-600" /> {order.technicianName}
                            </span>
                            {order.technicianPhone && (
                              <a href={`tel:${order.technicianPhone}`} className="text-blue-600 hover:underline text-[11px] font-mono">
                                ({order.technicianPhone})
                              </a>
                            )}
                          </div>

                          {order.adminNotes && (
                            <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px] italic">
                              Note: {order.adminNotes}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Side: Total & Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-xl font-mono font-black text-slate-900">
                            ₹{order.grandTotal}
                          </div>
                          <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                            {order.paymentStatus === 'paid' ? 'PAID (UPI)' : 'PAY ON SERVICE'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Edit Booking Button */}
                          <button
                            onClick={() => handleOpenEdit(order)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-blue-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                            title="Edit booking details, partner, date and status"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* Delete Booking Button */}
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                            title="Delete booking from live system"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Advance Status Button */}
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <button
                              onClick={() => handleAdvanceStatus(order)}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-[#2563EB] text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
                            >
                              {order.status === 'confirmed' && 'Assign Partner ➔'}
                              {order.status === 'technician_assigned' && 'Mark In-Progress ➔'}
                              {order.status === 'in_progress' && 'Mark Completed ✓'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── TAB 1.5: Custom & Unique Requests Operations ──────── */}
        {activeTab === 'custom_requests' && (() => {
          const filteredCustomRequests = customRequests.filter((r) => {
            const matchesStatus = customStatusFilter === 'all' || r.status === customStatusFilter;
            const matchesSearch = 
              customSearchQuery === '' ||
              r.id.toLowerCase().includes(customSearchQuery.toLowerCase()) ||
              r.customerName.toLowerCase().includes(customSearchQuery.toLowerCase()) ||
              r.customerPhone.toLowerCase().includes(customSearchQuery.toLowerCase()) ||
              r.title.toLowerCase().includes(customSearchQuery.toLowerCase()) ||
              r.categoryTitle.toLowerCase().includes(customSearchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
          });

          const pendingCount = customRequests.filter(r => r.status === 'submitted' || r.status === 'under_review').length;
          const quotedCount = customRequests.filter(r => r.status === 'quoted').length;
          const assignedCount = customRequests.filter(r => r.status === 'assigned' || r.status === 'in_progress').length;
          const completedCount = customRequests.filter(r => r.status === 'completed').length;

          return (
            <div className="space-y-6">
              {/* Summary Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Requests</span>
                  <span className="text-2xl font-black font-mono text-slate-900">{customRequests.length}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">All customer briefs</span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-amber-800">Pending Review</span>
                    {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
                  </div>
                  <span className="text-2xl font-black font-mono text-amber-900">{pendingCount}</span>
                  <span className="text-[11px] text-amber-700 block mt-0.5">Needs admin quote</span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 shadow-2xs">
                  <span className="text-[10px] font-extrabold uppercase text-blue-800 block">Quoted Awaiting</span>
                  <span className="text-2xl font-black font-mono text-blue-900">{quotedCount}</span>
                  <span className="text-[11px] text-blue-700 block mt-0.5">Quote sent to user</span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 text-purple-950 shadow-2xs">
                  <span className="text-[10px] font-extrabold uppercase text-purple-800 block">Active In-Flight</span>
                  <span className="text-2xl font-black font-mono text-purple-900">{assignedCount}</span>
                  <span className="text-[11px] text-purple-700 block mt-0.5">Runner / Tech assigned</span>
                </div>
              </div>

              {/* Controls & Filter Bar */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customSearchQuery}
                      onChange={(e) => setCustomSearchQuery(e.target.value)}
                      placeholder="Search name, phone, ID, or item..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-[#2563EB] outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                    <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Status:</span>
                    <select
                      value={customStatusFilter}
                      onChange={(e) => setCustomStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none cursor-pointer focus:bg-white focus:border-[#2563EB]"
                    >
                      <option value="all">All Statuses ({customRequests.length})</option>
                      <option value="submitted">Submitted / New ({customRequests.filter(r => r.status === 'submitted').length})</option>
                      <option value="under_review">Under Review ({customRequests.filter(r => r.status === 'under_review').length})</option>
                      <option value="quoted">Quoted ({customRequests.filter(r => r.status === 'quoted').length})</option>
                      <option value="assigned">Partner Assigned ({customRequests.filter(r => r.status === 'assigned').length})</option>
                      <option value="in_progress">In Progress ({customRequests.filter(r => r.status === 'in_progress').length})</option>
                      <option value="completed">Completed ({customRequests.filter(r => r.status === 'completed').length})</option>
                      <option value="cancelled">Cancelled ({customRequests.filter(r => r.status === 'cancelled').length})</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => setCustomRequestModalOpen(true, 'other')}
                    className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Custom Request</span>
                  </button>

                  <button
                    onClick={() => {
                      resetCustomRequestsToDefault();
                      toast.success('Reset demo custom requests to standard catalog.');
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                    title="Reset to default custom requests"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Requests List */}
              <div className="space-y-4">
                {filteredCustomRequests.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-500 shadow-xs">
                    <Sparkles className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <h4 className="text-base font-bold text-slate-800">No Custom Requests Match Filters</h4>
                    <p className="text-xs text-slate-400 mt-1">Try resetting your search query or status filter.</p>
                  </div>
                ) : (
                  filteredCustomRequests.map((req: CustomRequest) => {
                    const currentQuoteInput = quoteInputs[req.id] !== undefined ? quoteInputs[req.id] : (req.quotedPrice ? String(req.quotedPrice) : '');
                    const currentPartnerName = partnerInputs[req.id]?.name !== undefined ? partnerInputs[req.id].name : (req.partnerName || '');
                    const currentPartnerPhone = partnerInputs[req.id]?.phone !== undefined ? partnerInputs[req.id].phone : (req.partnerPhone || '');
                    const currentAdminNote = adminNotesInputs[req.id] !== undefined ? adminNotesInputs[req.id] : (req.adminNotes || '');

                    const categoryEmoji = 
                      req.categoryType === 'meat_delivery' ? '🥩' :
                      req.categoryType === 'parcel_pickup' ? '📦' :
                      req.categoryType === 'courier_express' ? '🚚' :
                      req.categoryType === 'unique_repair' ? '🔧' :
                      req.categoryType === 'errand' ? '⚡' : '✨';

                    return (
                      <div
                        key={req.id}
                        className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 transition-all hover:shadow-md"
                      >
                        {/* Header Row */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{categoryEmoji}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black font-mono text-slate-900">
                                  #{req.id}
                                </span>
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                  {req.categoryTitle}
                                </span>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  req.urgency === 'urgent_60min'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {req.urgency === 'urgent_60min' ? '⚡ Urgent 60m' : req.urgency}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400">
                                Received {formatNumericDate(new Date(req.createdAt))} • Preferred: {req.preferredDate} ({req.preferredTimeSlot})
                              </span>
                            </div>
                          </div>

                          {/* Customer Contact & Quick Actions */}
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${req.customerPhone}`}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{req.customerPhone}</span>
                            </a>

                            <a
                              href={`https://wa.me/${req.customerPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>

                            <button
                              onClick={() => {
                                if (confirm(`Delete request #${req.id}?`)) {
                                  deleteCustomRequest(req.id);
                                  toast.success(`Request #${req.id} deleted.`);
                                }
                              }}
                              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                              title="Delete request"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Customer Info & Requirement */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-slate-900">Customer:</span>
                            <span className="text-slate-700 font-medium">{req.customerName}</span>
                            {req.customerEmail && (
                              <span className="text-slate-400">({req.customerEmail})</span>
                            )}
                          </div>

                          <h4 className="text-base font-extrabold text-slate-900">
                            {req.title}
                          </h4>

                          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-normal">
                            {req.description}
                          </p>
                        </div>

                        {/* Location Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {req.isDelivery && req.pickupAddress ? (
                            <>
                              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                                <span className="text-[10px] font-extrabold uppercase text-amber-800 flex items-center gap-1 mb-0.5">
                                  <MapPin className="w-3 h-3 text-amber-600" /> Pickup Point / Store:
                                </span>
                                <span className="text-slate-900 font-medium">{req.pickupAddress}</span>
                              </div>

                              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80">
                                <span className="text-[10px] font-extrabold uppercase text-blue-800 flex items-center gap-1 mb-0.5">
                                  <Navigation className="w-3 h-3 text-[#2563EB]" /> Delivery Destination:
                                </span>
                                <span className="text-slate-900 font-medium">{req.dropAddress || req.serviceAddress}</span>
                              </div>
                            </>
                          ) : (
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 sm:col-span-2">
                              <span className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center gap-1 mb-0.5">
                                <MapPin className="w-3 h-3 text-[#2563EB]" /> Doorstep Service Address:
                              </span>
                              <span className="text-slate-900 font-medium">{req.serviceAddress}</span>
                            </div>
                          )}
                        </div>

                        {/* Admin Action Control Deck */}
                        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-[#2563EB]" />
                            <span>Operations Desk Controls</span>
                          </span>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            {/* 1. Quote Price */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-600 block">
                                Calculate & Quote Price (₹):
                                {req.estimatedBudget && (
                                  <span className="text-slate-400 font-normal ml-1">(User Target: ₹{req.estimatedBudget})</span>
                                )}
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  value={currentQuoteInput}
                                  onChange={(e) => setQuoteInputs(prev => ({ ...prev, [req.id]: e.target.value }))}
                                  placeholder="e.g. 250"
                                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 outline-none focus:border-[#2563EB]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const parsed = Number(currentQuoteInput);
                                    if (isNaN(parsed) || parsed <= 0) {
                                      toast.error('Please enter a valid price amount');
                                      return;
                                    }
                                    updateCustomRequestStatus(req.id, 'quoted', parsed);
                                    toast.success(`Quote of ₹${parsed} submitted to customer for #${req.id}`);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold whitespace-nowrap active:scale-95 transition-all cursor-pointer"
                                >
                                  Save Quote
                                </button>
                              </div>
                            </div>

                            {/* 2. Assign Partner / Runner */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-600 block">
                                Assign Runner / Specialist:
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={currentPartnerName}
                                  onChange={(e) => setPartnerInputs(prev => ({
                                    ...prev,
                                    [req.id]: { name: e.target.value, phone: currentPartnerPhone }
                                  }))}
                                  placeholder="Partner Name"
                                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:border-[#2563EB]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!currentPartnerName.trim()) {
                                      toast.error('Please enter partner name');
                                      return;
                                    }
                                    updateCustomRequest(req.id, {
                                      partnerName: currentPartnerName.trim(),
                                      partnerPhone: currentPartnerPhone.trim() || '+91 98450 77123',
                                      status: 'assigned',
                                    });
                                    toast.success(`Assigned ${currentPartnerName} to #${req.id}`);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold whitespace-nowrap active:scale-95 transition-all cursor-pointer"
                                >
                                  Assign
                                </button>
                              </div>
                            </div>

                            {/* 3. Status Switcher */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-600 block">
                                Live Status Pipeline:
                              </label>
                              <select
                                value={req.status}
                                onChange={(e) => {
                                  const newStatus = e.target.value as CustomRequestStatus;
                                  updateCustomRequestStatus(req.id, newStatus);
                                  toast.success(`Request #${req.id} status updated to ${newStatus}`);
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 outline-none cursor-pointer focus:border-[#2563EB]"
                              >
                                <option value="submitted">⏳ Submitted / New</option>
                                <option value="under_review">🔍 Under Admin Review</option>
                                <option value="quoted">💵 Quoted (Price Sent)</option>
                                <option value="assigned">👤 Runner Assigned</option>
                                <option value="in_progress">⚡ In Progress</option>
                                <option value="completed">✓ Completed</option>
                                <option value="cancelled">✕ Cancelled</option>
                              </select>
                            </div>
                          </div>

                          {/* Admin Operational Notes Row */}
                          <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2">
                            <input
                              type="text"
                              value={currentAdminNote}
                              onChange={(e) => setAdminNotesInputs(prev => ({ ...prev, [req.id]: e.target.value }))}
                              placeholder="Add internal operational note (e.g. Call butcher at 10am, runner Manoj assigned)..."
                              className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium outline-none focus:border-[#2563EB]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                updateCustomRequest(req.id, { adminNotes: currentAdminNote });
                                toast.success(`Saved internal note for #${req.id}`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors"
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()}


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
                    <span className="text-[11px] font-bold text-emerald-600">Reparzo Assured</span>
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

        {/* ── TAB 5: Geo Hubs & Serviceable Radius Coverage ─── */}
        {activeTab === 'coverage' && <AdminGeoCoverageTab />}
      </div>

      {/* ── Admin Edit Booking Modal ───────────────────────── */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Edit Booking Dispatch
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Booking #{editingOrder.id}
                </h3>
              </div>

              <button
                onClick={() => setEditingOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Order Status */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Order Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as OrderBooking['status'] })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-[#2563EB]"
                >
                  <option value="confirmed">Confirmed (Order Placed)</option>
                  <option value="technician_assigned">Technician Assigned</option>
                  <option value="in_progress">Repair In Progress</option>
                  <option value="completed">Completed (Service Done)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Technician Assignment */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Assigned Service Partner
                </label>
                <input
                  type="text"
                  placeholder="Technician Name"
                  value={editForm.technicianName}
                  onChange={(e) => setEditForm({ ...editForm, technicianName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                />
                <input
                  type="text"
                  placeholder="Technician Phone (e.g. +91 98450 88219)"
                  value={editForm.technicianPhone}
                  onChange={(e) => setEditForm({ ...editForm, technicianPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                />

                {/* Quick Fleet Select Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold self-center mr-1">Quick Select:</span>
                  {[
                    { name: 'Ramesh Gowda (Certified Master Technician)', phone: '+91 98450 88219' },
                    { name: 'Sunil Gowda (Verified Partner)', phone: '+91 98765 43210' },
                    { name: 'Rajesh Kumar (Senior Partner)', phone: '+91 98444 55667' },
                    { name: 'Manjunath K (BMS Specialist)', phone: '+91 97333 44556' },
                  ].map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, technicianName: p.name, technicianPhone: p.phone })}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[10px] font-bold text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      {p.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scheduled Date & Working Hours Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Scheduled Date (Numbers)
                  </label>
                  <input
                    type="date"
                    value={editForm.scheduledDate}
                    onChange={(e) => setEditForm({ ...editForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                  />
                  <div className="flex gap-1 mt-1">
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, scheduledDate: new Date().toISOString().slice(0, 10) })}
                      className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Today
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        setEditForm({ ...editForm, scheduledDate: d.toISOString().slice(0, 10) });
                      }}
                      className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Working Hours Slot
                  </label>
                  <select
                    value={editForm.timeSlot}
                    onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                  >
                    <option value="Working Hours (10:00 AM - 06:00 PM)">Working Hours (10:00 AM – 06:00 PM)</option>
                    <option value="Morning Slot (10:00 AM - 01:00 PM)">Morning Slot (10:00 AM – 01:00 PM)</option>
                    <option value="Afternoon Slot (01:00 PM - 04:00 PM)">Afternoon Slot (01:00 PM – 04:00 PM)</option>
                    <option value="Late Afternoon Slot (04:00 PM - 06:00 PM)">Late Afternoon Slot (04:00 PM – 06:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={editForm.customerName}
                    onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Customer Phone
                  </label>
                  <input
                    type="text"
                    value={editForm.customerPhone}
                    onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              {/* Doorstep Address */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Doorstep Service Address
                </label>
                <textarea
                  rows={2}
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Grand Total & Payment Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Grand Total Payable (₹)
                  </label>
                  <input
                    type="number"
                    value={editForm.grandTotal}
                    onChange={(e) => setEditForm({ ...editForm, grandTotal: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Payment Status
                  </label>
                  <select
                    value={editForm.paymentStatus}
                    onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value as 'paid' | 'pending' })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                  >
                    <option value="paid">PAID (UPI/Card)</option>
                    <option value="pending">PENDING (Pay on Service)</option>
                  </select>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Internal Admin Dispatch Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call customer 15m prior, spare parts dispatched from hub"
                  value={editForm.adminNotes}
                  onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Service Completion PIN (4 Digits) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Service Completion PIN (4 Digits)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="4-digit PIN (e.g. 8492)"
                    value={editForm.completionPin}
                    onChange={(e) => setEditForm({ ...editForm, completionPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#2563EB]"
                  />
                  <KeyRound className="w-4 h-4 text-amber-600 absolute left-3 top-2.5" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Customer holds this PIN and shares it with the technician only after physical work is completed.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete booking ${editingOrder.id}?`)) {
                      deleteOrder(editingOrder.id);
                      toast.success(`Booking ${editingOrder.id} deleted.`);
                      setEditingOrder(null);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                >
                  Delete Booking
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Admin Create Manual Booking Modal ──────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Phone-in / Manual Booking
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Create New Doorstep Booking
                </h3>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={createForm.customerName}
                    onChange={(e) => setCreateForm({ ...createForm, customerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Customer Phone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="9845012345"
                    value={createForm.customerPhone}
                    onChange={(e) => setCreateForm({ ...createForm, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Doorstep Service Address *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Door No, Building, Street, Area, Pincode"
                  value={createForm.address}
                  onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Scheduled Date (Numbers)
                  </label>
                  <input
                    type="date"
                    value={createForm.scheduledDate}
                    onChange={(e) => setCreateForm({ ...createForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Working Hours Slot
                  </label>
                  <select
                    value={createForm.timeSlot}
                    onChange={(e) => setCreateForm({ ...createForm, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                  >
                    <option value="Working Hours (10:00 AM - 06:00 PM)">Working Hours (10:00 AM – 06:00 PM)</option>
                    <option value="Morning Slot (10:00 AM - 01:00 PM)">Morning Slot (10:00 AM – 01:00 PM)</option>
                    <option value="Afternoon Slot (01:00 PM - 04:00 PM)">Afternoon Slot (01:00 PM – 04:00 PM)</option>
                    <option value="Late Afternoon Slot (04:00 PM - 06:00 PM)">Late Afternoon Slot (04:00 PM – 06:00 PM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Assigned Technician
                  </label>
                  <input
                    type="text"
                    value={createForm.technicianName}
                    onChange={(e) => setCreateForm({ ...createForm, technicianName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Initial Status
                  </label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as OrderBooking['status'] })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="technician_assigned">Technician Assigned</option>
                    <option value="in_progress">Repair In Progress</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Grand Total (₹)
                  </label>
                  <input
                    type="number"
                    value={createForm.grandTotal}
                    onChange={(e) => setCreateForm({ ...createForm, grandTotal: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Service Completion PIN (4 Digits)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 5491"
                      value={createForm.completionPin}
                      onChange={(e) => setCreateForm({ ...createForm, completionPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#2563EB]"
                    />
                    <KeyRound className="w-4 h-4 text-amber-600 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-[#2563EB] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
