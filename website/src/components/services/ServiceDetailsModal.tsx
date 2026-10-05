import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Star, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Sparkles, 
  MapPin, 
  ArrowRight, 
  Wrench, 
  ShoppingBag,
  BadgeCheck,
  Zap,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const ServiceDetailsModal: React.FC = () => {
  const { 
    selectedService, 
    setSelectedService, 
    cart, 
    addToCart, 
    updateQuantity, 
    setCartDrawerOpen,
    location,
    isOrderingEnabled,
    upgradeMessage
  } = useAppStore();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedService]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedService(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedService]);

  if (!selectedService) return null;

  const cartItem = cart.find((i) => i.service.id === selectedService.id);
  const quantity = cartItem?.quantity || 0;
  const savings = selectedService.originalPrice > selectedService.price 
    ? selectedService.originalPrice - selectedService.price 
    : 0;
  const discountPercent = selectedService.originalPrice > selectedService.price
    ? Math.round((savings / selectedService.originalPrice) * 100)
    : 0;

  const handleClose = () => {
    setSelectedService(null);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto cursor-pointer animate-in fade-in duration-200"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white border border-slate-100 w-full max-w-xl rounded-3xl sm:rounded-4xl shadow-2xl overflow-hidden text-slate-900 my-auto max-h-[92vh] flex flex-col cursor-default relative"
        >
          {/* Top Sticky/Floating Close Button */}
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="absolute top-3.5 right-3.5 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-md"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Scrollable Content Body */}
          <div className="overflow-y-auto flex-1 no-scrollbar">
            {/* Hero Image Section */}
            <div className="relative h-60 sm:h-72 w-full bg-slate-900 overflow-hidden">
              <img
                src={selectedService.image}
                alt={selectedService.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-black/30 pointer-events-none" />

              {/* Category & Badge Top Left */}
              <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-1.5 z-10">
                <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-[#2563EB] border border-slate-200 shadow-xs">
                  {selectedService.categoryTitle}
                </span>
                {selectedService.isPopular && (
                  <span className="bg-rose-500/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" /> High Demand
                  </span>
                )}
              </div>

              {/* Bottom Badges on Image */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-white z-10">
                <div className="flex items-center gap-2">
                  <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{selectedService.durationMinutes} mins service time</span>
                  </div>
                </div>

                <div className="bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm border border-emerald-400/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{selectedService.warrantyDays || 30} Days Warranty</span>
                </div>
              </div>
            </div>

            {/* Service Information Details */}
            <div className="p-5 sm:p-6 space-y-5">
              {/* Rating & SubCategory Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="text-xs font-black text-amber-900">{selectedService.rating}</span>
                    <span className="text-[11px] text-amber-700/80 font-medium">
                      ({selectedService.reviewsCount.toLocaleString()} verified ratings)
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Reparzo Assured</span>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {selectedService.title}
                </h1>

                {selectedService.subCategoryTitle && selectedService.subCategoryTitle !== selectedService.title && (
                  <p className="text-xs font-bold text-[#2563EB] mt-1">
                    {selectedService.subCategoryTitle}
                  </p>
                )}
              </div>

              {/* Full Description */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  About This Service
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {selectedService.description}
                </p>
              </div>

              {/* Inclusions / Scope of Work */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Verified Inclusions & Scope
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-600">
                    {(selectedService.inclusions || []).length} Points Covered
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(selectedService.inclusions && selectedService.inclusions.length > 0 ? selectedService.inclusions : [
                    'Comprehensive multi-point inspection',
                    'Genuine manufacturer-approved spares',
                    'Post-service testing & cooling/pressure check',
                    'Doorstep service cleanup by certified pro'
                  ]).map((inc: string, idx: number) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-start gap-2.5 shadow-2xs hover:border-emerald-300 transition-colors"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-xs font-medium text-slate-800 leading-tight">
                        {inc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust & Guarantee Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col items-center text-center">
                  <ShieldCheck className="w-5 h-5 text-[#2563EB] mb-1.5" />
                  <span className="text-[11px] font-extrabold text-slate-900">Genuine Spares</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Brand-certified parts</span>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col items-center text-center">
                  <Wrench className="w-5 h-5 text-indigo-600 mb-1.5" />
                  <span className="text-[11px] font-extrabold text-slate-900">Verified Pros</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Police & skill verified</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col items-center text-center">
                  <Zap className="w-5 h-5 text-emerald-600 mb-1.5" />
                  <span className="text-[11px] font-extrabold text-slate-900">Fast Arrival</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Doorstep in mins</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 flex flex-col items-center text-center">
                  <BadgeCheck className="w-5 h-5 text-amber-600 mb-1.5" />
                  <span className="text-[11px] font-extrabold text-slate-900">{selectedService.warrantyDays || 30}D Warranty</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Free revisit guarantee</span>
                </div>
              </div>

              {/* Location & Serviceability Notice */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700 min-w-0">
                  <MapPin className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                  <span className="truncate">
                    Serviceable at: <strong>{location.area || 'Davangere Central'}</strong> ({location.city || 'Davangere'})
                  </span>
                </div>
                <span className="text-emerald-700 font-bold text-[11px] bg-emerald-100/70 px-2 py-0.5 rounded-md flex-shrink-0">
                  Active Hub
                </span>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Footer Action Bar */}
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-white/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 flex-shrink-0 shadow-lg">
            {/* Price Column */}
            <div className="w-full sm:w-auto flex items-center justify-between sm:block">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Starts from</span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-slate-900">
                  ₹{selectedService.price}
                </span>
                {selectedService.originalPrice > selectedService.price && (
                  <span className="text-sm font-mono text-slate-400 line-through">
                    ₹{selectedService.originalPrice}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                Base starting estimate • Inclusive of inspection & genuine spares guarantee
              </span>
            </div>

            {/* Buttons Column */}
            <div className="w-full sm:w-auto flex items-center gap-2">
              {!isOrderingEnabled ? (
                <button
                  type="button"
                  disabled
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs uppercase tracking-wider cursor-not-allowed select-none"
                  title={upgradeMessage}
                >
                  Service Upgrade In Progress
                </button>
              ) : location.isServiceable === false ? (
                <button
                  type="button"
                  disabled
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs uppercase tracking-wider cursor-not-allowed select-none"
                >
                  Unavailable in Area
                </button>
              ) : quantity === 0 ? (
                <button
                  type="button"
                  onClick={() => addToCart(selectedService)}
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-extrabold text-sm uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/25"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add to Cart</span>
                </button>
              ) : (
                <div className="w-full sm:w-auto flex items-center gap-2">
                  {/* Stepper */}
                  <div className="flex items-center bg-[#2563EB] border border-[#2563EB] rounded-2xl overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => updateQuantity(selectedService.id, quantity - 1)}
                      className="p-2 sm:px-3 hover:bg-blue-700 text-white active:scale-90 transition-transform cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 text-sm font-mono font-black text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(selectedService.id, quantity + 1)}
                      className="p-2 sm:px-3 hover:bg-blue-700 text-white active:scale-90 transition-transform cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* View Cart Button */}
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      setCartDrawerOpen(true);
                    }}
                    className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <ShoppingBag className="w-4 h-4 text-cyan-400" />
                    <span>View Cart</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
