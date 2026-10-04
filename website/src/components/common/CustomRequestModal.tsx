import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Package, 
  Truck, 
  Wrench, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle,
  Phone,
  User,
  DollarSign,
  Send,
  Navigation,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import type { CustomCategoryType, CustomRequest } from '../../types';

interface CategoryOption {
  type: CustomCategoryType;
  title: string;
  badge: string;
  icon: string;
  placeholderTitle: string;
  placeholderDesc: string;
  defaultIsDelivery: boolean;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    type: 'meat_delivery',
    title: 'Meat Delivery',
    badge: 'Fresh & Chilled',
    icon: '🥩',
    placeholderTitle: 'e.g. Pick up 1.5kg tender mutton chops from local butcher',
    placeholderDesc: 'Mention specific shop or market (e.g. Russell Market / Shivaji Nagar), exact cut, bone-in or boneless, and packaging instructions...',
    defaultIsDelivery: true,
  },
  {
    type: 'parcel_pickup',
    title: 'Parcel Pick & Drop',
    badge: 'Instant 60m',
    icon: '📦',
    placeholderTitle: 'e.g. Pick up office keys and laptop charger from home',
    placeholderDesc: 'Detail item dimensions, recipient contact person, flat/gate security instructions, and delivery urgency...',
    defaultIsDelivery: true,
  },
  {
    type: 'courier_express',
    title: 'Courier Express',
    badge: 'Same Day',
    icon: '🚚',
    placeholderTitle: 'e.g. Urgent signed legal contract and business documents',
    placeholderDesc: 'Provide sender docket details, tamper seal instructions, and required time-of-day delivery deadline...',
    defaultIsDelivery: true,
  },
  {
    type: 'unique_repair',
    title: 'Specialty Repair',
    badge: 'Master Tech',
    icon: '🔧',
    placeholderTitle: 'e.g. Vintage stereo turntable belt replacement or chimney motor fix',
    placeholderDesc: 'Describe the appliance brand, model number, observed fault, error codes or unusual sounds, and if any previous attempts were made...',
    defaultIsDelivery: false,
  },
  {
    type: 'errand',
    title: 'On-Demand Errand',
    badge: 'Personal Runner',
    icon: '⚡',
    placeholderTitle: 'e.g. Buy specific medicine strips from Apollo & drop at clinic',
    placeholderDesc: 'List exact store names, medicine names/dosages, alternate brand preferences, and bills reimbursement notes...',
    defaultIsDelivery: true,
  },
  {
    type: 'other',
    title: 'Other Unique Request',
    badge: 'Custom Quote',
    icon: '✨',
    placeholderTitle: 'e.g. Custom furniture assembly or heavy gear movement',
    placeholderDesc: 'Explain your requirement in full detail so the Reparzo admin desk can review, calculate pricing, and assign the right specialist...',
    defaultIsDelivery: false,
  },
];

export const CustomRequestModal: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isCustomRequestModalOpen, 
    setCustomRequestModalOpen, 
    customRequestModalInitialCategory,
    addCustomRequest, 
    location, 
    user,
    setUser
  } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState<CustomCategoryType>('other');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isDelivery, setIsDelivery] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [urgency, setUrgency] = useState<'urgent_60min' | 'same_day' | 'scheduled'>('urgent_60min');
  const [preferredDate, setPreferredDate] = useState('Today');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('Immediate (As Soon As Possible)');
  const [estimatedBudget, setEstimatedBudget] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<CustomRequest | null>(null);

  // Sync state when modal opens or initialCategory changes
  useEffect(() => {
    if (isCustomRequestModalOpen) {
      setSubmittedRequest(null);
      
      // Determine initial category
      let initialType: CustomCategoryType = 'other';
      if (customRequestModalInitialCategory) {
        const found = CATEGORY_OPTIONS.find(
          (c) => c.type === customRequestModalInitialCategory || c.title.toLowerCase().includes(customRequestModalInitialCategory.toLowerCase())
        );
        if (found) initialType = found.type;
      }
      setSelectedCategory(initialType);
      
      const opt = CATEGORY_OPTIONS.find((c) => c.type === initialType) || CATEGORY_OPTIONS[5];
      setIsDelivery(opt.defaultIsDelivery);

      // Pre-fill user contact info
      if (user) {
        setCustomerName(user.name || '');
        setCustomerPhone(user.phone || '');
        setCustomerEmail(user.email || '');
      }

      // Pre-fill addresses
      const defaultLoc = location.fullAddress || `${location.area}, ${location.city} - ${location.pincode}`;
      setServiceAddress(defaultLoc);
      setDropAddress(defaultLoc);
    }
  }, [isCustomRequestModalOpen, customRequestModalInitialCategory, user, location]);

  const handleCategorySelect = (type: CustomCategoryType) => {
    setSelectedCategory(type);
    const opt = CATEGORY_OPTIONS.find((c) => c.type === type);
    if (opt) {
      setIsDelivery(opt.defaultIsDelivery);
    }
  };

  const handleClose = () => {
    setCustomRequestModalOpen(false);
    setSubmittedRequest(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a brief title for your request.');
      return;
    }

    if (description.trim().length < 10) {
      toast.error('Please describe your requirement with at least 10 characters.');
      return;
    }

    if (!customerPhone.trim()) {
      toast.error('Please enter a valid contact phone number so admin can reach you.');
      return;
    }

    if (isDelivery && !pickupAddress.trim()) {
      toast.error('Please provide a pickup location or store address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const currentOpt = CATEGORY_OPTIONS.find((c) => c.type === selectedCategory) || CATEGORY_OPTIONS[5];

      const newRequest = addCustomRequest({
        customerName: customerName.trim() || 'Guest Customer',
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        title: title.trim(),
        categoryType: selectedCategory,
        categoryTitle: currentOpt.title,
        description: description.trim(),
        isDelivery,
        pickupAddress: isDelivery ? pickupAddress.trim() : undefined,
        dropAddress: isDelivery ? dropAddress.trim() : undefined,
        serviceAddress: isDelivery ? dropAddress.trim() : (serviceAddress.trim() || location.fullAddress),
        preferredDate,
        preferredTimeSlot,
        urgency,
        estimatedBudget: estimatedBudget ? Number(estimatedBudget) : undefined,
      });

      if (!user && customerPhone.trim()) {
        const cleanPhone = customerPhone.trim();
        setUser({
          id: `usr-${Date.now()}`,
          name: customerName.trim() || 'Reparzo Customer',
          phone: cleanPhone.startsWith('+91') ? cleanPhone : `+91 ${cleanPhone}`,
          email: customerEmail.trim() || undefined,
          role: 'user',
        });
      }

      setSubmittedRequest(newRequest);
      toast.success('Your custom request has been transmitted to Reparzo Admin!');
    } catch (err) {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeOption = CATEGORY_OPTIONS.find((c) => c.type === selectedCategory) || CATEGORY_OPTIONS[5];

  if (!isCustomRequestModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 my-auto z-10 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="relative px-5 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-slate-900 via-[#0B1536] to-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Direct Admin Dispatch
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">Reparzo On-Demand</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Custom & Unique Service Request
                </h2>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">
            {submittedRequest ? (
              /* Success View */
              <div className="text-center py-6 sm:py-8 space-y-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-2">
                    Request Received #{submittedRequest.id}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Your request is in front of Reparzo Admin!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                    Our central operations team has received your custom brief. An operations admin will review, calculate a transparent quote, or assign a verified runner promptly.
                  </p>
                </div>

                {/* Request Summary Receipt */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto space-y-2.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                    <span className="text-slate-500 font-semibold">Service Type:</span>
                    <span className="font-extrabold text-slate-900">{submittedRequest.categoryTitle}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                    <span className="text-slate-500 font-semibold">Requirement:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[220px]">{submittedRequest.title}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                    <span className="text-slate-500 font-semibold">Urgency:</span>
                    <span className="font-bold text-blue-600 uppercase text-[10px] bg-blue-50 px-2 py-0.5 rounded-full">
                      {submittedRequest.urgency === 'urgent_60min' ? '⚡ Express Priority' : submittedRequest.urgency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Contact:</span>
                    <span className="font-bold text-slate-800">{submittedRequest.customerPhone}</span>
                  </div>
                </div>

                {/* Next Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      handleClose();
                      navigate('/bookings');
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Track in My Bookings</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleClose}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Request Form View */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Category Selection Pills */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    1. Select Service Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                    {CATEGORY_OPTIONS.map((opt) => {
                      const isSelected = selectedCategory === opt.type;
                      return (
                        <button
                          key={opt.type}
                          type="button"
                          onClick={() => handleCategorySelect(opt.type)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-blue-50/80 border-[#2563EB] shadow-xs ring-2 ring-blue-500/20'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xl">{opt.icon}</span>
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {opt.badge}
                            </span>
                          </div>
                          <div>
                            <span className={`text-xs font-bold block ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                              {opt.title}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Request Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    2. What do you need? <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={activeOption.placeholderTitle}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 outline-none text-xs sm:text-sm font-semibold transition-all"
                  />
                </div>

                {/* 3. Detailed Instructions */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      3. Detailed Description & Specifications <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Min 10 chars</span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={activeOption.placeholderDesc}
                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 outline-none text-xs sm:text-sm leading-relaxed transition-all resize-none"
                  />
                </div>

                {/* 4. Service Mode Toggle: Delivery vs Doorstep */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Is this a Point-to-Point Pickup & Drop?
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {isDelivery ? 'Runner will pick up from Address A and hand off at Address B' : 'Technician or specialist visits your doorstep'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDelivery(!isDelivery)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        isDelivery ? 'bg-[#2563EB]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isDelivery ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Address Fields */}
                  {isDelivery ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/80">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-500" />
                          <span>Pickup Address / Shop Name</span>
                        </label>
                        <input
                          type="text"
                          required={isDelivery}
                          value={pickupAddress}
                          onChange={(e) => setPickupAddress(e.target.value)}
                          placeholder="Store name, street, area (e.g. Shivaji Nagar Meat Market)"
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium focus:border-[#2563EB] outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1 flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-[#2563EB]" />
                          <span>Delivery / Drop Address</span>
                        </label>
                        <input
                          type="text"
                          required={isDelivery}
                          value={dropAddress}
                          onChange={(e) => setDropAddress(e.target.value)}
                          placeholder="Apartment, flat, area, landmark"
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium focus:border-[#2563EB] outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1 border-t border-slate-200/80">
                      <label className="text-[11px] font-bold text-slate-600 block mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#2563EB]" />
                        <span>Doorstep Service Address</span>
                      </label>
                      <input
                        type="text"
                        value={serviceAddress}
                        onChange={(e) => setServiceAddress(e.target.value)}
                        placeholder="House / Flat, Apartment, Street, Landmark"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium focus:border-[#2563EB] outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* 5. Urgency, Timing & Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Speed & Urgency</span>
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none cursor-pointer focus:bg-white focus:border-[#2563EB]"
                    >
                      <option value="urgent_60min">⚡ Express Priority (Immediate)</option>
                      <option value="same_day">📅 Today Daytime</option>
                      <option value="scheduled">🕒 Scheduled Slot</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Preferred Time Slot
                    </label>
                    <input
                      type="text"
                      value={preferredTimeSlot}
                      onChange={(e) => setPreferredTimeSlot(e.target.value)}
                      placeholder="e.g. 11:30 AM or ASAP"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Target Budget (₹)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={estimatedBudget}
                      onChange={(e) => setEstimatedBudget(e.target.value)}
                      placeholder="Optional (Quote me)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                {/* 6. Customer Contact Details */}
                <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-900">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Contact Info for Operations Admin</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium outline-none focus:border-[#2563EB]"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Mobile Number (e.g. +91 98450 12345)"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  </div>
                </div>

                {/* 7. Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#2563EB] to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Sending to Admin Desk...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Request to Reparzo Admin ➔</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-500 text-center mt-2">
                    🔒 No upfront payment required. You only pay after quote confirmation & dispatch.
                  </p>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
