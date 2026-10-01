import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Star, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Layers, 
  Zap, 
  Check, 
  Smile, 
  PhoneCall,
  Flame,
  Award
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { BannerCarousel } from '../components/home/BannerCarousel';
import { CategorySection } from '../components/home/CategorySection';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    services, 
    cart, 
    addToCart, 
    updateQuantity, 
    setActiveCategorySlug,
    setAuthModalOpen,
    user
  } = useAppStore();

  const popularServices = services.filter((s) => s.isPopular);

  return (
    <div className="space-y-6 sm:space-y-12 pb-24 text-slate-100 bg-[#080D1A]">
      {/* ── 1. Infinite Banner Carousel (Blinkit / Zetlod Style) ── */}
      <BannerCarousel />

      {/* ── 2. Admin-Editable Category Grid ──────────── */}
      <CategorySection />

      {/* ── 3. Popular Services Row (Blinkit Quick Add) ─ */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#E32402] bg-[#E32402]/10 px-2.5 py-0.5 rounded-full border border-[#E32402]/20 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> High Demand Today
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Most Booked Doorstep Repairs
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Fixed transparent pricing with zero surprise charges.
            </p>
          </div>

          <button
            onClick={() => {
              setActiveCategorySlug('all');
              navigate('/services');
            }}
            className="self-start sm:self-auto text-xs sm:text-sm font-bold text-[#4770DB] hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Browse All {services.length} Services</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Popular Service Cards Carousel/Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularServices.map((service) => {
            const cartItem = cart.find((i) => i.service.id === service.id);
            const quantity = cartItem?.quantity || 0;

            return (
              <div
                key={service.id}
                className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-[#4770DB]/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                <div>
                  {/* Image with zoom */}
                  <div className="relative h-40 sm:h-44 rounded-2xl overflow-hidden mb-3 border border-slate-700/80">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#080D1A]/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase text-[#4770DB] border border-[#4770DB]/30">
                      {service.categoryTitle}
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" /> {service.durationMinutes} mins
                    </div>
                  </div>

                  {/* Title & Rating */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-white">{service.rating}</span>
                    <span className="text-[11px] text-slate-400">({service.reviewsCount})</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {service.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {service.description}
                  </p>
                </div>

                {/* Price and Add Button */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-mono font-black text-white">
                        ₹{service.price}
                      </span>
                      <span className="text-xs font-mono text-slate-500 line-through">
                        ₹{service.originalPrice}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400">
                      30-Day Warranty
                    </span>
                  </div>

                  {/* Blinkit Quick Add Button */}
                  <div>
                    {quantity === 0 ? (
                      <button
                        onClick={() => addToCart(service)}
                        className="px-4 py-2 rounded-xl bg-[#4770DB] hover:bg-[#385cc4] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-[#4770DB]/20 active:scale-90 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    ) : (
                      <div className="flex items-center bg-[#0E1B4D] border border-[#4770DB] rounded-xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => updateQuantity(service.id, quantity - 1)}
                          className="p-1.5 hover:bg-slate-800 text-white active:scale-90 transition-transform cursor-pointer"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-white">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(service.id, quantity + 1)}
                          className="p-1.5 hover:bg-slate-800 text-white active:scale-90 transition-transform cursor-pointer"
                          aria-label="Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. Live Metrics Strip (Zetlod & Mallige Standards) ── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0E1B4D] via-[#142357] to-[#0E1B4D] border border-slate-800 shadow-2xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#4770DB]">
              Why Bengaluru Chooses Reparzo
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Engineered for Speed, Trust & Precision
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-2xl sm:text-4xl font-black font-mono text-[#4770DB]">
                18–25m
              </div>
              <div className="text-xs font-bold text-white mt-1">Average Arrival</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Technicians in every neighborhood</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-2xl sm:text-4xl font-black font-mono text-emerald-400">
                30 Days
              </div>
              <div className="text-xs font-bold text-white mt-1">Free Rework Warranty</div>
              <div className="text-[11px] text-slate-400 mt-0.5">On every service & repair job</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-2xl sm:text-4xl font-black font-mono text-amber-400">
                4.9 ★
              </div>
              <div className="text-xs font-bold text-white mt-1">Customer Rating</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Based on 18,400+ reviews</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-2xl sm:text-4xl font-black font-mono text-purple-400">
                100%
              </div>
              <div className="text-xs font-bold text-white mt-1">Background Verified</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Police & skill verified technicians</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. How It Works (Blinkit 3-Step Flow) ─────── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#4770DB]">
            Simple & Transparent
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            How Doorstep Repair Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 relative">
            <div className="w-12 h-12 rounded-2xl bg-[#4770DB]/20 text-[#4770DB] border border-[#4770DB]/30 flex items-center justify-center font-mono font-black text-lg mb-4">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Select Your Repair</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose from AC, bike, plumbing, electrical, and appliance care with upfront price quotes.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 relative">
            <div className="w-12 h-12 rounded-2xl bg-[#E32402]/20 text-[#E32402] border border-[#E32402]/30 flex items-center justify-center font-mono font-black text-lg mb-4">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Technician Arrives</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              A certified local partner reaches your doorstep in 60-90 minutes equipped with diagnostic tools.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono font-black text-lg mb-4">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Test & Pay After</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify the work with our digital checklist. Pay via UPI or Cash only after 100% satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. Partner Onboarding Callout ─────────────── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#0E1B4D] to-slate-900 border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-left">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 mb-2 block">
              Join The Reparzo Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Are you an AC, Bike, or Electrical Technician?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Partner with Reparzo to get steady daily repair jobs in your neighborhood. Earn up to ₹45,000/month with zero lead commissions.
            </p>
          </div>

          <button
            onClick={() => setAuthModalOpen(true, 'partner')}
            className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-[#4770DB] hover:bg-[#385cc4] text-white text-xs sm:text-sm font-bold shadow-xl shadow-[#4770DB]/30 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            Register as Service Partner ➔
          </button>
        </div>
      </section>
    </div>
  );
};
