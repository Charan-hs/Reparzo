import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Truck, 
  Sparkles, 
  Phone, 
  QrCode, 
  Banknote,
  ChevronRight,
  User,
  Zap,
  ShoppingBag,
  AlertTriangle,
  Plus,
  Home,
  Briefcase,
  KeyRound
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../store/useAppStore';
import type { BookingSlot, OrderBooking, CartItem } from '../types';
import { 
  formatNumericDate, 
  formatShortDate, 
  getOrderWorkingSchedule, 
  REPARZO_WORKING_HOURS 
} from '../lib/workingHours';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    getCartMetrics, 
    location, 
    user, 
    clearCart, 
    addOrder,
    setAuthModalOpen,
    savedAddresses,
    activeAddressId,
    selectSavedAddress,
    setAddressModalOpen,
    setLocationModalOpen
  } = useAppStore();

  const { totalItems, subtotal, inspectionFee, platformFee, discount, grandTotal } = getCartMetrics();

  // Form State
  const activeAddress = savedAddresses.find((a) => a.id === activeAddressId);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone ? user.phone.replace('+91 ', '') : '');
  const [flatNumber, setFlatNumber] = useState(activeAddress?.flatNumber || '');
  const [landmark, setLandmark] = useState(activeAddress?.landmark || '');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const hasCompleteAddress = Boolean(name.trim() && phone.trim().length >= 10 && flatNumber.trim());

  useEffect(() => {
    if (activeAddress) {
      if (activeAddress.flatNumber) setFlatNumber(activeAddress.flatNumber);
      if (activeAddress.landmark) setLandmark(activeAddress.landmark);
    }
  }, [activeAddress]);

  useEffect(() => {
    if (user) {
      if (user.name && !name) setName(user.name);
      if (user.phone && !phone) setPhone(user.phone.replace('+91 ', ''));
    }
  }, [user]);
  
  // Real-time Working Hours & Date Calculations
  const now = new Date();
  const currentHour = now.getHours();
  const isWithinWorkingHours = currentHour >= REPARZO_WORKING_HOURS.startHour && currentHour < REPARZO_WORKING_HOURS.endHour;
  const isAfterWorkingHours = currentHour >= REPARZO_WORKING_HOURS.endHour;

  const todayObj = new Date();
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const dayAfterObj = new Date();
  dayAfterObj.setDate(dayAfterObj.getDate() + 2);

  const todayLabel = `Today (${formatShortDate(todayObj)})`;
  const tomorrowLabel = `Tomorrow (${formatShortDate(tomorrowObj)})`;
  const dayAfterLabel = `Day After (${formatShortDate(dayAfterObj)})`;

  // Slot selection
  const [slotType, setSlotType] = useState<'instant' | 'scheduled'>('instant');
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('Working Hours (10:00 AM - 06:00 PM)');

  // Payment method (Pay After Service or Delivery is the exclusive option)
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cash'>('cash');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Completed order view
  const [completedOrder, setCompletedOrder] = useState<OrderBooking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If cart is empty and no order just completed, show empty state
  if (cart.length === 0 && !completedOrder) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center p-6 bg-[#F8FAFC] text-slate-900">
        <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Services in Checkout</h2>
        <p className="text-sm text-slate-500 max-w-sm mb-6">
          Add an AC repair, bike service, or home care package to proceed with doorstep booking.
        </p>
        <button
          onClick={() => navigate('/services')}
          className="px-6 py-3 rounded-full bg-[#2563EB] text-white text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 transition-transform cursor-pointer"
        >
          Explore Services Catalog
        </button>
      </div>
    );
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'REPARZO50') {
      setCouponDiscount(50);
      toast.success('Coupon REPARZO50 applied! ₹50 extra discount.');
    } else {
      toast.error('Invalid coupon code. Try REPARZO50');
    }
  };

  const handleConfirmBooking = () => {
    if (location.isServiceable === false) {
      toast.error('Currently service is not available in your location. We are working to expand our services here soon!');
      return;
    }

    if (!name.trim() || phone.length < 10 || !flatNumber.trim()) {
      setIsEditingAddress(true);
      toast.error('Please fill in complete contact and doorstep address details.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      let chosenDateObj = todayObj;
      if (slotType === 'scheduled') {
        if (selectedDate.includes('Tomorrow')) chosenDateObj = tomorrowObj;
        else if (selectedDate.includes('Day After')) chosenDateObj = dayAfterObj;
      } else {
        if (isAfterWorkingHours) chosenDateObj = tomorrowObj;
      }

      const formattedTargetDate = formatNumericDate(chosenDateObj);

      const slot: BookingSlot = {
        type: slotType,
        dateLabel: slotType === 'instant' 
          ? (isAfterWorkingHours ? `Tomorrow (${formattedTargetDate})` : `Today (${formattedTargetDate})`)
          : `${selectedDate} (${formattedTargetDate})`,
        timeSlot: slotType === 'instant' 
          ? `Working Hours (${REPARZO_WORKING_HOURS.label})` 
          : selectedTimeSlot,
        scheduledDate: chosenDateObj.toISOString(),
      };

      const finalGrandTotal = Math.max(0, grandTotal - couponDiscount);

      const newOrder: OrderBooking = {
        id: `RPZ-${Math.floor(100000 + Math.random() * 900000)}`,
        items: [...cart],
        itemTotal: subtotal,
        platformFee,
        discount: discount + couponDiscount,
        grandTotal: finalGrandTotal,
        address: `${flatNumber}, ${landmark}, ${location.area}, ${location.city} - ${location.pincode}`,
        customerName: name,
        customerPhone: `+91 ${phone}`,
        slot,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        technicianName: 'Ramesh Gowda (Certified Master Technician)',
        technicianPhone: '+91 98450 88219',
        completionPin: Math.floor(1000 + Math.random() * 9000).toString(),
      };

      addOrder(newOrder);
      setCompletedOrder(newOrder);
      clearCart();
      toast.success('Booking Confirmed! Technician assigned.');
    }, 800);
  };

  // ── Confirmation Screen ──────────────────────────────
  if (completedOrder) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8 text-slate-900">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Confirmed Banner */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Booking ID: {completedOrder.id}
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
              Doorstep Service Confirmed!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Our verified technician is preparing tools and dispatched to your location.
            </p>

            {/* Live Tracking Stepper */}
            {(() => {
              const schedule = getOrderWorkingSchedule(completedOrder);
              return (
                <div className="mt-8 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Live Status Tracker
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                      {schedule.statusBadgeText}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        ✓
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Booking Confirmed</span>
                        <span className="text-[11px] text-slate-500">
                          {(() => {
                            const d = new Date(completedOrder.createdAt);
                            return !isNaN(d.getTime()) ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : completedOrder.createdAt;
                          })()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 animate-pulse">
                        2
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Technician Assigned</span>
                        <span className="text-[11px] text-[#2563EB] font-semibold">
                          {completedOrder.technicianName} • Background Verified
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center text-xs font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Scheduled Doorstep Visit</span>
                        <span className="text-[11px] text-slate-600 font-medium">
                          {schedule.scheduleSubtitle}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Assigned Partner Card */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold">
                  RG
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{completedOrder.technicianName}</h4>
                  <span className="text-[11px] text-slate-500">{completedOrder.technicianPhone}</span>
                </div>
              </div>
              <a
                href={`tel:${completedOrder.technicianPhone || '+916362000263'}`}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            </div>

            {/* Service Completion PIN Card */}
            <div className="mt-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold flex-shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 block">
                    Service Completion PIN
                  </span>
                  <span className="text-xs text-amber-800 leading-snug">
                    Share this PIN with your technician only after physical work is verified and completed.
                  </span>
                </div>
              </div>

              <div className="px-4 py-2 rounded-xl bg-white border border-amber-300 font-mono font-black text-xl text-amber-900 tracking-widest text-center shadow-2xs flex-shrink-0">
                {completedOrder.completionPin || completedOrder.id.replace(/\D/g, '').slice(-4) || '1234'}
              </div>
            </div>

            {/* Pay After Service or Delivery Banner */}
            <div className="mt-4 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 block">
                    Payment Due After Service or Delivery
                  </span>
                  <span className="text-xs text-emerald-800 leading-snug">
                    Total Amount: <strong className="font-mono text-emerald-950 font-bold">₹{completedOrder.grandTotal}</strong> • Pay via Cash, UPI (GPay/PhonePe/Paytm), or Card once work is inspected and approved.
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-200/80 text-emerald-900 flex-shrink-0 text-center">
                Zero Advance Paid
              </span>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/bookings')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                Track Live Booking & View PIN ➔
              </button>
              <button
                onClick={() => navigate('/services')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold cursor-pointer transition-colors"
              >
                Book Another Service
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-transparent text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout Form Flow ──────────────────────────────
  const finalPayable = Math.max(0, grandTotal - couponDiscount);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-10 px-3 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Secure Checkout
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Confirm Doorstep Repair Booking
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          
          {/* Left Column (2 Cols): Details Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ── 1. Doorstep Address & Contact ───────────── */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#2563EB]" />
                  1. Doorstep Address & Contact
                </h3>
                {location.isServiceable !== false ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Serviceable Area
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    ⚠ Outside Service Area
                  </span>
                )}
              </div>

              {/* Serviceability Warning Banner if out of radius */}
              {location.isServiceable === false && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-xs text-amber-900 font-medium">
                      Service unavailable in <strong>{location.area}</strong> (Coming Soon 🚀)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocationModalOpen(true)}
                    className="self-end sm:self-center px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] whitespace-nowrap cursor-pointer transition-colors shadow-xs flex-shrink-0"
                  >
                    Change Address
                  </button>
                </div>
              )}

              {/* ── Minimized Summary Card (When address & contact are complete) ── */}
              {hasCompleteAddress && !isEditingAddress ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#2563EB] border border-blue-200 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                      {activeAddress?.label === 'Work' ? (
                        <Briefcase className="w-4 h-4" />
                      ) : (
                        <Home className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {activeAddress?.label || 'Doorstep Address'}
                        </span>
                        {activeAddress?.isDefault && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100/80 text-[#2563EB]">
                            Default
                          </span>
                        )}
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-700 font-semibold">{name}</span>
                        <span className="text-slate-500 font-mono text-[11px]">(+91 {phone})</span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-snug break-words">
                        {flatNumber ? `${flatNumber}, ` : ''}
                        {landmark ? `${landmark}, ` : ''}
                        <strong className="text-slate-800">{location.area}</strong>, {location.city} - {location.pincode}
                      </p>

                      {location.hubName && (
                        <span className="inline-block text-[11px] text-slate-400 mt-1">
                          Hub: {location.hubName} ({location.distanceKm || '1'} km)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(true)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Compact Form View (When editing or filling initial details) ── */
                <div className="space-y-3 pt-0.5">
                  {/* Quick Address Pills */}
                  {savedAddresses.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                      {savedAddresses.map((addr) => {
                        const isSelected = activeAddress?.id === addr.id || location.fullAddress === addr.fullAddress;
                        return (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              selectSavedAddress(addr.id);
                              if (addr.flatNumber) setFlatNumber(addr.flatNumber);
                              if (addr.landmark) setLandmark(addr.landmark);
                              if (name && phone && addr.flatNumber) {
                                setIsEditingAddress(false);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] shadow-2xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {addr.label === 'Work' ? <Briefcase className="w-3.5 h-3.5" /> : <Home className="w-3.5 h-3.5" />}
                            <span>{addr.label}</span>
                            {addr.isDefault && <span className="text-[10px] opacity-70">(Default)</span>}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setAddressModalOpen(true)}
                        className="px-2.5 py-1.5 rounded-xl border border-dashed border-blue-300 text-[#2563EB] hover:bg-blue-50 text-xs font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add on Map</span>
                      </button>
                    </div>
                  )}

                  {/* 2x2 Input Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-[#2563EB]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Mobile Number
                      </label>
                      <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 overflow-hidden focus-within:bg-white focus-within:border-[#2563EB]">
                        <span className="px-2.5 py-1.5 bg-slate-100 text-slate-600 font-mono text-xs border-r border-slate-200">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 px-3 py-1.5 bg-transparent text-slate-900 font-mono text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        House / Flat / Building
                      </label>
                      <input
                        type="text"
                        required
                        value={flatNumber}
                        onChange={(e) => setFlatNumber(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-[#2563EB]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Landmark / Street (Optional)
                      </label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:bg-white focus:border-[#2563EB]"
                      />
                    </div>
                  </div>

                  {/* 1-Line Compact Location Bar */}
                  <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between gap-2">
                    <span className="truncate">
                      Area: <strong className="text-slate-900">{location.area}</strong> ({location.city} - {location.pincode})
                      {location.hubName && <span className="text-slate-400 ml-1.5">• Hub: {location.hubName}</span>}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setLocationModalOpen(true)}
                        className="text-[#2563EB] font-bold hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                      {hasCompleteAddress && (
                        <>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => setIsEditingAddress(false)}
                            className="text-emerald-700 font-bold hover:underline cursor-pointer"
                          >
                            Done
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── 2. Time Slot & Urgency Selection ────────── */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#2563EB]" />
                  2. Choose Preferred Arrival Time
                </h3>
              </div>

              {/* Instant Express vs Scheduled Tabs */}
              {/* Instant vs Scheduled Tabs */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSlotType('instant')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    slotType === 'instant'
                      ? 'bg-blue-50/80 border-[#2563EB] shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${isWithinWorkingHours ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
                    <span className="text-xs font-extrabold uppercase text-[#2563EB]">
                      {isWithinWorkingHours ? 'Today (Working Hours)' : 'Next Working Day'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {isWithinWorkingHours ? `Today (${formatShortDate(todayObj)})` : `Tomorrow (${formatShortDate(tomorrowObj)})`}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isWithinWorkingHours ? 'Technician arrives today (10 AM - 6 PM)' : 'Service window starts tomorrow at 10 AM'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSlotType('scheduled')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    slotType === 'scheduled'
                      ? 'bg-blue-50/80 border-[#2563EB] shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-extrabold uppercase text-[#2563EB] block mb-1">
                    Schedule Later
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">Choose Date & Slot</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Select working hour slot (10 AM - 6 PM)</p>
                </button>
              </div>

              {/* Scheduled slot details */}
              {slotType === 'scheduled' && (
                <div className="pt-2 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'Today', label: todayLabel },
                      { key: 'Tomorrow', label: tomorrowLabel },
                      { key: 'Day After', label: dayAfterLabel },
                    ].map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setSelectedDate(d.key)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedDate === d.key
                            ? 'bg-[#2563EB] text-white border-[#2563EB]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {[
                      'Working Hours (10:00 AM - 06:00 PM)',
                      'Morning Slot (10:00 AM - 01:00 PM)',
                      'Afternoon Slot (01:00 PM - 04:00 PM)',
                      'Late Afternoon Slot (04:00 PM - 06:00 PM)',
                    ].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`w-full p-2.5 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition-all cursor-pointer ${
                          selectedTimeSlot === slot
                            ? 'bg-blue-50 text-[#2563EB] border-[#2563EB] font-bold'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{slot}</span>
                        {selectedTimeSlot === slot && <span className="text-[#2563EB] font-bold">●</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── 3. Payment Option ───────────────────────── */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  3. Payment Mode
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Zero Advance Required
                </span>
              </div>

              {/* Exclusive Option: Pay After Service or Delivery */}
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 flex items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold flex-shrink-0 mt-0.5 sm:mt-0">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">Pay After Service or Delivery</h4>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                        Selected
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Pay via <strong>Cash, UPI (Google Pay, PhonePe, Paytm)</strong>, or <strong>Card</strong> directly to the technician or courier runner after inspection, job completion, or order delivery.
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>100% Satisfaction Guarantee:</strong> Inspect your repair or package before making payment. No advance deposit or prepay required.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Order Summary */}
          <div className="space-y-6">
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Booking Summary ({totalItems})
              </h3>

              {/* Service Items mini-list */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cart.map((item: CartItem) => (
                  <div key={item.service.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-slate-900 truncate">{item.service.title}</h5>
                      <span className="text-[11px] text-slate-500">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{item.service.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Box */}
              <form onSubmit={handleApplyCoupon} className="pt-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Promo / Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. REPARZO50"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs uppercase outline-none focus:bg-white focus:border-[#2563EB]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1d4ed8] active:scale-95 transition-all cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </form>

              {/* Price Calculation */}
              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                {discount > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Total Item MRP</span>
                    <span className="font-mono line-through">₹{subtotal + discount}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Package Discount</span>
                    <span className="font-mono">-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Item Subtotal</span>
                  <span className="font-mono text-slate-900 font-semibold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Inspection Fee</span>
                  <span className="font-mono">
                    <span className="line-through text-slate-400 mr-1.5 text-[11px]">₹49</span>
                    <span className="text-emerald-600 font-bold">₹0</span>
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform & Logistics</span>
                  <span className="font-mono">
                    <span className="line-through text-slate-400 mr-1.5 text-[11px]">₹19</span>
                    <span className="text-emerald-600 font-bold">₹0</span>
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon REPARZO50</span>
                    <span className="font-mono">-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-2 flex justify-between text-base font-bold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-xl font-mono text-[#2563EB]">₹{finalPayable}</span>
                </div>
              </div>

              {/* Confirm Booking CTA */}
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isSubmitting || location.isServiceable === false}
                className={`w-full py-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  location.isServiceable === false
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none select-none'
                    : 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer'
                }`}
              >
                <span>
                  {location.isServiceable === false
                    ? 'Service Unavailable in this Location (Coming Soon)'
                    : isSubmitting
                    ? 'Confirming Dispatch...'
                    : 'Confirm Booking • Pay After Service / Delivery'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero cancellation fee before technician arrival</span>
              </div>

              {/* Terms & Privacy Notice */}
              <div className="pt-2 border-t border-slate-100 text-center text-[11px] text-slate-500 leading-relaxed space-y-1">
                <p>
                  By confirming, you agree to Reparzo's{' '}
                  <Link to="/terms" target="_blank" className="text-[#2563EB] font-bold hover:underline">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" target="_blank" className="text-[#2563EB] font-bold hover:underline">
                    Privacy Policy
                  </Link>.
                </p>
                <p className="text-[10px] text-slate-400">
                  Bookings are subject to independent partner confirmation. Charges vary based on parts and scope.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
