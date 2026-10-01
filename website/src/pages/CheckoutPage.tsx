import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../store/useAppStore';
import type { BookingSlot, OrderBooking, CartItem } from '../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    getCartMetrics, 
    location, 
    user, 
    clearCart, 
    addOrder,
    setAuthModalOpen 
  } = useAppStore();

  const { totalItems, subtotal, inspectionFee, platformFee, discount, grandTotal } = getCartMetrics();

  // Form State
  const [name, setName] = useState(user?.name || 'Charan H.S.');
  const [phone, setPhone] = useState(user?.phone?.replace('+91 ', '') || '9845012345');
  const [flatNumber, setFlatNumber] = useState('Flat 402, Green Glen Heights');
  const [landmark, setLandmark] = useState('Opposite BDA Complex');
  
  // Slot selection
  const [slotType, setSlotType] = useState<'instant' | 'scheduled'>('instant');
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('Morning (09:00 AM - 12:00 PM)');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cash'>('upi');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Completed order view
  const [completedOrder, setCompletedOrder] = useState<OrderBooking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If cart is empty and no order just completed, show empty state
  if (cart.length === 0 && !completedOrder) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center p-6 bg-[#080D1A] text-slate-100">
        <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Services in Checkout</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Add an AC repair, bike service, or home care package to proceed with doorstep booking.
        </p>
        <button
          onClick={() => navigate('/services')}
          className="px-6 py-3 rounded-full bg-[#4770DB] text-white text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-transform"
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
    if (!name.trim() || phone.length < 10 || !flatNumber.trim()) {
      toast.error('Please fill in complete contact and doorstep address details.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      const slot: BookingSlot = {
        type: slotType,
        dateLabel: slotType === 'instant' ? 'Today (Instant Express)' : selectedDate,
        timeSlot: slotType === 'instant' ? 'Arriving in 60-90 Mins' : selectedTimeSlot,
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
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        technicianName: 'Ramesh Gowda (Certified Master Technician)',
        technicianPhone: '+91 98450 88219',
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
      <div className="min-h-screen bg-[#080D1A] py-10 px-4 sm:px-6 lg:px-8 text-slate-100">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Confirmed Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#0E1B4D] to-slate-900 border border-slate-700/80 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#4770DB] bg-[#4770DB]/10 px-3 py-1 rounded-full border border-[#4770DB]/20">
              Booking ID: {completedOrder.id}
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-white mt-3">
              Doorstep Service Confirmed!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
              Our verified technician is preparing tools and dispatched to your location.
            </p>

            {/* Live Tracking Stepper */}
            <div className="mt-8 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-4 block">
                Live Status Tracker
              </span>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Booking Confirmed</span>
                    <span className="text-[11px] text-slate-400">{completedOrder.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4770DB] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 animate-pulse">
                    2
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Technician Assigned</span>
                    <span className="text-[11px] text-cyan-300">
                      {completedOrder.technicianName} • Rating 4.9 ★
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 opacity-60">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center text-xs flex-shrink-0">
                    3
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block">On the Way</span>
                    <span className="text-[11px] text-slate-500">Live GPS tracking will unlock shortly</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 opacity-60">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center text-xs flex-shrink-0">
                    4
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block">Service Completed & Tested</span>
                    <span className="text-[11px] text-slate-500">30-day warranty starts upon job completion</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Technician Call */}
            <div className="mt-5 p-4 rounded-2xl bg-[#142357] border border-[#4770DB]/30 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-300 block">
                  Assigned Partner
                </span>
                <span className="text-xs font-bold text-white block">
                  {completedOrder.technicianName}
                </span>
              </div>
              <a
                href={`tel:${completedOrder.technicianPhone}`}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Phone className="w-3.5 h-3.5" /> Call Partner
              </a>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#4770DB] text-white text-xs font-bold"
              >
                Return to Home
              </button>
              <button
                onClick={() => navigate('/services')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold hover:text-white"
              >
                Book Another Service
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
    <div className="min-h-screen bg-[#080D1A] py-6 sm:py-10 px-3 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4770DB]">
              Secure Checkout
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Confirm Doorstep Repair Booking
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          
          {/* Left Column (2 Cols): Details Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ── 1. Doorstep Address & Contact ───────────── */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0E1B4D]/70 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#4770DB]" />
                  1. Doorstep Address & Contact
                </h3>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  ⚡ {location.etaMinutes} Mins Hub
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-[#4770DB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Mobile Number
                  </label>
                  <div className="flex items-center rounded-xl bg-slate-900 border border-slate-700 overflow-hidden">
                    <span className="px-3 py-2.5 bg-slate-800 text-slate-300 font-mono text-xs border-r border-slate-700">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-3.5 py-2.5 bg-transparent text-white font-mono text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    House / Flat / Building Name
                  </label>
                  <input
                    type="text"
                    required
                    value={flatNumber}
                    onChange={(e) => setFlatNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-[#4770DB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Landmark / Street (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-[#4770DB]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                  <span>Area: <strong>{location.area}</strong> ({location.city} - {location.pincode})</span>
                  <span className="text-[11px] text-[#4770DB] font-semibold">Matched Hub</span>
                </div>
              </div>
            </div>

            {/* ── 2. Time Slot & Urgency Selection ────────── */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0E1B4D]/70 border border-slate-800 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#4770DB]" />
                  2. Choose Preferred Arrival Time
                </h3>
              </div>

              {/* Instant Express vs Scheduled Tabs */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSlotType('instant')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    slotType === 'instant'
                      ? 'bg-[#4770DB]/20 border-[#4770DB] shadow-md shadow-[#4770DB]/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#E32402] animate-ping" />
                    <span className="text-xs font-extrabold uppercase text-[#E32402]">
                      Instant Express
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">In 60–90 Minutes</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Technician heads directly to you</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSlotType('scheduled')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    slotType === 'scheduled'
                      ? 'bg-[#4770DB]/20 border-[#4770DB] shadow-md shadow-[#4770DB]/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-extrabold uppercase text-[#4770DB] block mb-1">
                    Schedule Later
                  </span>
                  <h4 className="text-sm font-bold text-white">Specific Date & Hour</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Convenient morning / evening slot</p>
                </button>
              </div>

              {/* Scheduled slot details */}
              {slotType === 'scheduled' && (
                <div className="pt-2 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {['Today', 'Tomorrow', 'Day After'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDate(d)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedDate === d
                            ? 'bg-[#4770DB] text-white border-[#4770DB]'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {[
                      'Morning (09:00 AM - 12:00 PM)',
                      'Afternoon (12:00 PM - 03:00 PM)',
                      'Evening (03:00 PM - 07:00 PM)',
                    ].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`w-full p-2.5 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition-all ${
                          selectedTimeSlot === slot
                            ? 'bg-slate-900 text-white border-[#4770DB]'
                            : 'bg-slate-950/60 text-slate-400 border-slate-800'
                        }`}
                      >
                        <span>{slot}</span>
                        {selectedTimeSlot === slot && <span className="text-[#4770DB] font-bold">●</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── 3. Payment Option ───────────────────────── */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0E1B4D]/70 border border-slate-800 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#4770DB]" />
                  3. Select Payment Mode
                </h3>
              </div>

              <div className="space-y-3">
                {/* UPI Option */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'upi'
                      ? 'bg-[#4770DB]/20 border-[#4770DB]'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xs">
                      UPI
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Instant UPI / QR Code</h4>
                      <p className="text-[11px] text-slate-400">Google Pay, PhonePe, Paytm, BHIM</p>
                    </div>
                  </div>
                  {paymentMethod === 'upi' && <CheckCircle2 className="w-5 h-5 text-[#4770DB]" />}
                </div>

                {/* Card Option */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'card'
                      ? 'bg-[#4770DB]/20 border-[#4770DB]'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Credit / Debit Card</h4>
                      <p className="text-[11px] text-slate-400">Visa, Mastercard, RuPay & Netbanking</p>
                    </div>
                  </div>
                  {paymentMethod === 'card' && <CheckCircle2 className="w-5 h-5 text-[#4770DB]" />}
                </div>

                {/* Cash After Service */}
                <div
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'cash'
                      ? 'bg-[#4770DB]/20 border-[#4770DB]'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">Pay After Service Done</h4>
                      <p className="text-[11px] text-slate-400">Pay cash or UPI to technician after inspection & test</p>
                    </div>
                  </div>
                  {paymentMethod === 'cash' && <CheckCircle2 className="w-5 h-5 text-[#4770DB]" />}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Order Summary */}
          <div className="space-y-6">
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0E1B4D]/80 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                Booking Summary ({totalItems})
              </h3>

              {/* Service Items mini-list */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cart.map((item: CartItem) => (
                  <div key={item.service.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-white truncate">{item.service.title}</h5>
                      <span className="text-[11px] text-slate-400">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-mono font-bold text-white">
                      ₹{item.service.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Box */}
              <form onSubmit={handleApplyCoupon} className="pt-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Promo / Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. REPARZO50"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs uppercase outline-none focus:border-[#4770DB]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-[#4770DB] text-white text-xs font-bold hover:bg-[#385cc4] active:scale-95 transition-all"
                  >
                    Apply
                  </button>
                </div>
              </form>

              {/* Price Calculation */}
              <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Item Subtotal</span>
                  <span className="font-mono">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Inspection Fee</span>
                  <span className="font-mono">
                    {inspectionFee === 0 ? <span className="text-emerald-400">FREE</span> : `₹${inspectionFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Edge Platform Fee</span>
                  <span className="font-mono">₹{platformFee}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Coupon REPARZO50</span>
                    <span className="font-mono">-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="border-t border-slate-800 pt-2 flex justify-between text-base font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-xl font-mono text-[#4770DB]">₹{finalPayable}</span>
                </div>
              </div>

              {/* Confirm Booking CTA */}
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#4770DB] via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-sm uppercase tracking-wider shadow-2xl shadow-[#4770DB]/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Confirming Dispatch...' : 'Confirm & Place Booking'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero cancellation fee until technician leaves hub</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
