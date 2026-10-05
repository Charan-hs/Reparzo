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
  Award,
  Shield,
  Wrench,
  AlertTriangle,
  Eye
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
    user,
    location,
    setLocationModalOpen,
    setSelectedService,
    isOrderingEnabled,
    upgradeMessage
  } = useAppStore();

  const popularServices = services.filter((s) => s.isPopular);

  return (
    <div className="space-y-6 sm:space-y-12 pb-24 text-slate-900 bg-[#F8FAFC]">
      {/* ── 1. Infinite Banner Carousel (Themallige Style) ── */}
      <BannerCarousel />

      {/* ── Non-Serviceable Area Notice Banner (Fully readable & compact) ── */}
      {location.isServiceable === false && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-2 mb-2">
          <div className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-amber-50/95 border border-amber-200/90 text-amber-950 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-950 font-medium leading-snug">
                Service currently unavailable in <strong className="font-bold text-amber-900">{location.area}</strong>
                <span className="hidden md:inline text-amber-700 text-[11px]"> — expanding technician coverage soon!</span>
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2.5 pl-6 sm:pl-0">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-200/90 text-amber-900 flex-shrink-0">
                Coming Soon 🚀
              </span>
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-2xs active:scale-95 transition-all whitespace-nowrap cursor-pointer"
              >
                Change Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Role-Specific Operational Hub Banner (Admins & Partners only) ── */}
      {user && (user.role === 'admin' || user.role === 'partner') && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {user.role === 'admin' && (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0B132B] to-slate-900 border border-slate-800 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#E32402] text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-rose-600/30 flex-shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      SuperAdmin Session
                    </span>
                    <span className="text-xs text-slate-300">Reparzo Central Operations</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Welcome, {user.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live telemetry: 24 active dispatches, 56 fleet partners online across Davangere.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#E32402] hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-600/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Go to Admin Dashboard ➔</span>
                </button>
              </div>
            </div>
          )}

          {user.role === 'partner' && (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/30 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-amber-500/30 flex-shrink-0">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Partner Portal
                    </span>
                    <span className="text-xs text-emerald-400 font-bold">● Status: ONLINE</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Welcome, {user.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    You have 3 nearby repair orders waiting for acceptance in your neighborhood.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/partner')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Open Jobs Board ➔</span>
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── 2. Admin-Editable Category Grid ──────────── */}
      <CategorySection />

      {/* ── 3. Popular Services Row (Blinkit Quick Add) ─ */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#E32402] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> High Demand Today
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Most Booked Doorstep Repairs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Fixed transparent pricing with zero surprise charges.
            </p>
          </div>

          <button
            onClick={() => {
              setActiveCategorySlug('all');
              navigate('/services');
            }}
            className="self-start sm:self-auto text-xs sm:text-sm font-bold text-[#2563EB] hover:text-[#1d4ed8] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Browse All {services.length} Services</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Popular Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularServices.map((service) => {
            const cartItem = cart.find((i) => i.service.id === service.id);
            const quantity = cartItem?.quantity || 0;

            return (
              <div
                key={service.id}
                className="p-4 rounded-3xl bg-white border border-slate-200/90 hover:border-[#2563EB]/40 transition-all flex flex-col justify-between group shadow-xs hover:shadow-xl hover:-translate-y-1 relative"
              >
                {/* Clickable Card Body to view full service details */}
                <div 
                  onClick={() => setSelectedService(service)}
                  className="cursor-pointer"
                  title="Click to view full service details, inclusions & warranty"
                >
                  {/* Image with zoom and hover badge */}
                  <div className="relative h-40 sm:h-44 rounded-2xl overflow-hidden mb-3 border border-slate-100 bg-slate-100">
                    <img
                      src={service.image}
                      alt={service.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase text-[#2563EB] border border-slate-200 shadow-xs">
                      {service.categoryTitle}
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" /> {service.durationMinutes} mins
                    </div>
                    {/* Visual Hover Badge */}
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="bg-white/95 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                        <Eye className="w-3.5 h-3.5 text-[#2563EB]" /> View Details
                      </span>
                    </div>
                  </div>

                  {/* Title & Rating */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-800">{service.rating}</span>
                    <span className="text-[11px] text-slate-400">({service.reviewsCount})</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors line-clamp-1">
                    {service.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-[#2563EB] group-hover:underline">
                    <span>View details & scope</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Price and Add Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div 
                    onClick={() => setSelectedService(service)}
                    className="cursor-pointer"
                    title="View details"
                  >
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Starts from</span>
                      <span className="text-lg font-mono font-black text-slate-900">
                        ₹{service.price}
                      </span>
                      {service.originalPrice && service.originalPrice > service.price && (
                        <span className="text-xs font-mono text-slate-400 line-through">
                          ₹{service.originalPrice}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Genuine Spares
                    </span>
                  </div>

                  {/* Blinkit Quick Add Button */}
                  <div onClick={(e) => e.stopPropagation()}>
                    {!isOrderingEnabled ? (
                      <span
                        className="px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wider block"
                        title={upgradeMessage}
                      >
                        Paused
                      </span>
                    ) : location.isServiceable === false ? (
                      <button
                        type="button"
                        disabled
                        className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs uppercase tracking-wider cursor-not-allowed select-none shadow-none"
                        title={`Service currently unavailable in ${location.area}. Coming soon!`}
                      >
                        <span>Unavailable</span>
                      </button>
                    ) : quantity === 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(service);
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-[#2563EB] text-[#2563EB] hover:text-white border border-[#2563EB]/40 font-extrabold text-xs uppercase tracking-wider active:scale-90 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    ) : (
                      <div className="flex items-center bg-[#2563EB] border border-[#2563EB] rounded-xl overflow-hidden shadow-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(service.id, quantity - 1);
                          }}
                          className="p-1.5 hover:bg-blue-700 text-white active:scale-90 transition-transform cursor-pointer"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-white">
                          {quantity}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(service.id, quantity + 1);
                          }}
                          className="p-1.5 hover:bg-blue-700 text-white active:scale-90 transition-transform cursor-pointer"
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

      {/* ── 4. Live Metrics Strip ── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Why Davangere Chooses Reparzo
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Engineered for Speed, Trust & Precision
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <div className="text-xl sm:text-2xl font-black font-mono text-[#2563EB]">
                10 AM–6 PM
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1">Daily Service Window</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Prompt same-day & scheduled visits</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <div className="text-2xl sm:text-4xl font-black font-mono text-emerald-600">
                100%
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1">Genuine Spare Parts</div>
              <div className="text-[11px] text-slate-500 mt-0.5">OEM verified & transparent pricing</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <div className="text-2xl sm:text-4xl font-black font-mono text-amber-500">
                4.9 ★
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1">Customer Rating</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Based on 18,400+ reviews</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <div className="text-2xl sm:text-4xl font-black font-mono text-purple-600">
                100%
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1">Background Verified</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Police & skill verified technicians</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. How It Works (Blinkit 3-Step Flow) ─────── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            Simple & Transparent
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            How Doorstep Repair Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center justify-center font-mono font-black text-lg mb-4">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Select Your Repair</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Choose from AC, bike, plumbing, electrical, and appliance care with upfront price quotes.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#E32402] border border-rose-200 flex items-center justify-center font-mono font-black text-lg mb-4">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Technician Arrives</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              A certified local partner reaches your doorstep on schedule equipped with diagnostic tools.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-mono font-black text-lg mb-4">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Test & Pay After</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify the work with our digital checklist. Pay via UPI or Cash only after 100% satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. Partner Onboarding Callout ─────────────── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#0E1B4D] via-[#142563] to-[#0E1B4D] border border-blue-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-left">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300 mb-2 block">
              Join The Reparzo Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Are you an AC, Bike, or Electrical Technician?
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
              Partner with Reparzo to get steady daily repair jobs in your neighborhood. Earn up to ₹45,000/month with zero lead commissions.
            </p>
          </div>

          <button
            onClick={() => setAuthModalOpen(true, 'partner')}
            className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs sm:text-sm font-bold shadow-xl shadow-blue-500/30 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            Register as Service Partner ➔
          </button>
        </div>
      </section>
    </div>
  );
};
