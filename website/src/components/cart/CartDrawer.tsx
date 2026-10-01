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
  Check
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
    getCartMetrics 
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
      <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md">
        {/* Backdrop click to dismiss */}
        <div 
          className="absolute inset-0" 
          onClick={() => setCartDrawerOpen(false)} 
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 350 }}
          className="relative w-full max-w-md bg-[#0E1B4D] h-full shadow-2xl flex flex-col z-10 border-l border-slate-700/80"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#142357] to-[#0E1B4D]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#4770DB] text-white flex items-center justify-center shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Your Service Cart</h3>
                <span className="text-xs text-slate-300">
                  {totalItems} {totalItems === 1 ? 'service item' : 'service items'} added
                </span>
              </div>
            </div>

            <button
              onClick={() => setCartDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">Your cart is empty</h4>
                <p className="text-xs text-slate-400 max-w-xs mb-6">
                  Explore our verified repair packages for AC, Bike, Electrical, and Home care.
                </p>
                <button
                  onClick={() => {
                    setCartDrawerOpen(false);
                    navigate('/services');
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#4770DB] text-white text-xs font-bold shadow-lg"
                >
                  Browse All Services
                </button>
              </div>
            ) : (
              <>
                {/* Savings Banner */}
                {discount > 0 && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <Percent className="w-4 h-4 flex-shrink-0" />
                    <span>You are saving ₹{discount} with Reparzo direct pricing!</span>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2.5">
                  {cart.map((item) => (
                    <div
                      key={item.service.id}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <img
                        src={item.service.image}
                        alt={item.service.title}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-700/80 flex-shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-[#4770DB] uppercase tracking-wider block">
                          {item.service.categoryTitle}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate">
                          {item.service.title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-mono font-bold text-white">
                            ₹{item.service.price * item.quantity}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 line-through">
                            ₹{item.service.originalPrice * item.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                        <button
                          onClick={() => updateQuantity(item.service.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-slate-700 text-slate-300 active:scale-90 transition-transform"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.service.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-slate-700 text-slate-300 active:scale-90 transition-transform"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upsell / Hygiene Shield Add-on */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-slate-800 space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Professional Service Kit
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">Included FREE</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Sanitized tools, shoe covers, mask, and cleanup after doorstep repair.
                  </p>
                </div>

                {/* Transparent Bill Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 mt-4 text-xs">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    Bill Summary
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Item Subtotal</span>
                    <span className="font-mono">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Inspection Fee</span>
                    <span className="font-mono">
                      {inspectionFee === 0 ? (
                        <span className="text-emerald-400 font-bold">FREE (Waived)</span>
                      ) : (
                        `₹${inspectionFee}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Cloudflare Edge & Platform Fee</span>
                    <span className="font-mono">₹{platformFee}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Total Savings</span>
                      <span className="font-mono">-₹{discount}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-white">
                    <span>To Pay</span>
                    <span className="text-base font-mono text-[#4770DB]">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Guarantee reassurance */}
                <div className="flex items-center gap-2 text-xs text-slate-400 justify-center pt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>30-Day Money Back & Rework Guarantee</span>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer CTA */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center gap-3">
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Total Payable
                </span>
                <span className="text-xl font-mono font-black text-white">
                  ₹{grandTotal}
                </span>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#4770DB] to-blue-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-[#4770DB]/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
