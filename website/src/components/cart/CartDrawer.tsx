import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  ShoppingBag,
  Percent,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const CartDrawer: React.FC = () => {
  const { 
    isCartDrawerOpen, 
    setCartDrawerOpen, 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    getCartMetrics,
    location,
    setLocationModalOpen
  } = useAppStore();

  const navigate = useNavigate();
  const { totalItems, subtotal, inspectionFee, platformFee, discount, grandTotal } = getCartMetrics();

  if (!isCartDrawerOpen) return null;

  const handleProceedToCheckout = () => {
    setCartDrawerOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
        {/* Backdrop click to dismiss */}
        <div 
          className="absolute inset-0" 
          onClick={() => setCartDrawerOpen(false)} 
        />

        {/* Drawer Panel in Light Theme */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 350 }}
          className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 text-slate-900"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Your Service Cart</h3>
                <span className="text-xs text-slate-500">
                  {totalItems} {totalItems === 1 ? 'service item' : 'service items'} added
                </span>
              </div>
            </div>

            <button
              onClick={() => setCartDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Your cart is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Explore our verified repair packages for AC, Bike, Electrical, and Home care.
                </p>
                <button
                  onClick={() => {
                    setCartDrawerOpen(false);
                    navigate('/services');
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#2563EB] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Browse All Services
                </button>
              </div>
            ) : (
              <>
                {/* Savings Banner */}
                {discount > 0 && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                    <Percent className="w-4 h-4 flex-shrink-0" />
                    <span>You are saving ₹{discount} with Reparzo direct pricing!</span>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2.5">
                  {cart.map((item) => (
                    <div
                      key={item.service.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-3"
                    >
                      <img
                        src={item.service.image}
                        alt={item.service.title}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider block">
                          {item.service.categoryTitle}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.service.title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-mono font-bold text-slate-900">
                            ₹{item.service.price * item.quantity}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 line-through">
                            ₹{item.service.originalPrice * item.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                        <button
                          onClick={() => updateQuantity(item.service.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-slate-200 text-slate-600 active:scale-90 transition-transform cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-mono font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.service.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-slate-200 text-slate-600 active:scale-90 transition-transform cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upsell / Hygiene Shield Add-on */}
                <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1.5 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Professional Service Kit
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-600">Included FREE</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Sanitized tools, shoe covers, mask, and cleanup after doorstep repair.
                  </p>
                </div>

                {/* Transparent Bill Breakdown */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5 mt-4 text-xs">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    Bill Summary
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Item Subtotal</span>
                    <span className="font-mono text-slate-900">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Inspection Fee</span>
                    <span className="font-mono">
                      {inspectionFee === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE (Waived)</span>
                      ) : (
                        `₹${inspectionFee}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Platform & Logistics Fee</span>
                    <span className="font-mono text-slate-900">₹{platformFee}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Package Discount</span>
                      <span className="font-mono">-₹{discount}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline font-bold text-sm text-slate-900">
                    <span>Grand Total</span>
                    <span className="font-mono text-base font-black text-[#2563EB]">
                      ₹{grandTotal}
                    </span>
                  </div>
                </div>

                {/* Guarantee Note */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-center pt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>30-Day Money-Back & Free Rework Guarantee</span>
                </div>
              </>
            )}
          </div>

          {/* Sticky Checkout CTA Footer */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-white">
              {location.isServiceable === false && (
                <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span className="truncate text-[11px] text-amber-900">
                      Unavailable in <strong>{location.area}</strong> (Coming Soon 🚀)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setCartDrawerOpen(false);
                      setLocationModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline whitespace-nowrap cursor-pointer flex-shrink-0"
                  >
                    Change
                  </button>
                </div>
              )}

              <button
                disabled={location.isServiceable === false}
                onClick={handleProceedToCheckout}
                className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-between transition-all ${
                  location.isServiceable === false
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none select-none'
                    : 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/25 active:scale-[0.98] cursor-pointer'
                }`}
              >
                <div className="text-left leading-tight">
                  <span className="text-[10px] block opacity-80 font-mono">To Pay</span>
                  <span className={`text-base font-mono font-black ${location.isServiceable === false ? 'text-slate-400' : 'text-white'}`}>
                    ₹{grandTotal}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span>{location.isServiceable === false ? 'Service Unavailable (Coming Soon)' : 'Proceed to Checkout'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
