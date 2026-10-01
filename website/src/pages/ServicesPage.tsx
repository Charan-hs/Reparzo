import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Star, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Minus, 
  Search, 
  CheckCircle2, 
  Sparkles,
  ArrowUpDown,
  Filter,
  Check,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Service, Category, CartItem } from '../types';

export const ServicesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const itemParam = searchParams.get('item');

  const { 
    services, 
    categories, 
    activeCategorySlug, 
    setActiveCategorySlug,
    cart,
    addToCart,
    updateQuantity,
    setCartDrawerOpen
  } = useAppStore();

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedServiceModal, setSelectedServiceModal] = useState<Service | null>(null);

  // Sync category param from URL
  useEffect(() => {
    if (categoryParam) {
      setActiveCategorySlug(categoryParam);
    }
  }, [categoryParam, setActiveCategorySlug]);

  // Open item modal if query param passed
  useEffect(() => {
    if (itemParam) {
      const match = services.find((s: Service) => s.slug === itemParam);
      if (match) setSelectedServiceModal(match);
    }
  }, [itemParam, services]);

  const activeCategories: { id: string; title: string; slug: string }[] = [
    { id: 'all', title: 'All Services', slug: 'all' },
    ...categories.filter((c: Category) => c.isActive),
  ];

  // Filter and sort services
  const displayedServices = services.filter((srv: Service) => {
    const matchesCategory =
      activeCategorySlug === 'all' || srv.categorySlug === activeCategorySlug;
    const matchesSearch =
      searchFilter.trim() === '' ||
      srv.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      srv.categoryTitle.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#080D1A] pb-24 text-slate-100">
      {/* ── Page Header Strip ─────────────────────────── */}
      <div className="bg-[#0E1B4D] border-b border-slate-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4770DB]">
                Reparzo Verified Catalog
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 30-Day Post-Repair Warranty
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Professional Home & Vehicle Repair
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Standardized rate cards, genuine spare parts, and zero hidden inspection charges.
            </p>
          </div>

          {/* Quick Search Input */}
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter services by name or problem..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 text-sm focus:border-[#4770DB] outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── Main Dual-Rail Layout (Blinkit Style) ──────── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* 1. Left Sticky Rail: Categories */}
          <aside className="w-full md:w-64 flex-shrink-0 md:sticky md:top-24 z-20">
            <div className="p-3 rounded-2xl bg-[#0E1B4D]/60 border border-slate-800 backdrop-blur-md">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-3 mb-2 block">
                Categories
              </span>

              {/* Horizontal scroll on mobile, vertical stack on desktop */}
              <div className="flex md:flex-col gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                {activeCategories.map((cat) => {
                  const isSelected = activeCategorySlug === cat.slug;
                  const count =
                    cat.slug === 'all'
                      ? services.length
                      : services.filter((s: Service) => s.categorySlug === cat.slug).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategorySlug(cat.slug)}
                      className={`py-2 px-3.5 rounded-xl text-xs font-bold text-left whitespace-nowrap md:whitespace-normal flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#4770DB] text-white shadow-md shadow-[#4770DB]/20'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="truncate">{cat.title}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono ml-2 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* 2. Right Content Area: Service Cards Grid */}
          <main className="flex-1 w-full min-w-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Showing {displayedServices.length} {displayedServices.length === 1 ? 'Service' : 'Services'}
              </span>
            </div>

            {displayedServices.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800">
                <Sparkles className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white mb-1">No services found</h4>
                <p className="text-xs text-slate-400 mb-4">
                  Try clearing your search query or selecting a different category from the left.
                </p>
                <button
                  onClick={() => {
                    setSearchFilter('');
                    setActiveCategorySlug('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#4770DB] text-white text-xs font-bold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                {displayedServices.map((service: Service) => {
                  const cartItem = cart.find((i: CartItem) => i.service.id === service.id);
                  const quantity = cartItem?.quantity || 0;

                  return (
                    <div
                      key={service.id}
                      className="p-4 sm:p-5 rounded-3xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-[#4770DB]/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl"
                    >
                      {/* Top: Image, Category Tag, Title, Duration */}
                      <div>
                        <div className="flex gap-4 items-start">
                          <img
                            src={service.image}
                            alt={service.title}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-700/80 group-hover:scale-105 transition-transform flex-shrink-0 cursor-pointer"
                            onClick={() => setSelectedServiceModal(service)}
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4770DB] bg-[#4770DB]/10 px-2 py-0.5 rounded border border-[#4770DB]/20">
                                {service.categoryTitle}
                              </span>
                              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                                <Star className="w-3 h-3 fill-emerald-400" /> {service.rating}
                              </span>
                            </div>

                            <h3
                              onClick={() => setSelectedServiceModal(service)}
                              className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors cursor-pointer line-clamp-1"
                            >
                              {service.title}
                            </h3>

                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-cyan-400" /> {service.durationMinutes} mins
                              </span>
                              <span>•</span>
                              <span className="text-emerald-400 font-medium">
                                {service.warrantyDays}-day warranty
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bullet Highlights */}
                        <div className="mt-3 space-y-1">
                          {service.inclusions.slice(0, 2).map((inc: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              <span className="truncate">{inc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Row: Price & Blinkit Add Counter */}
                      <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-mono font-black text-white">
                              ₹{service.price}
                            </span>
                            <span className="text-xs font-mono text-slate-400 line-through">
                              ₹{service.originalPrice}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                            Save ₹{service.originalPrice - service.price}
                          </span>
                        </div>

                        {/* Blinkit Quick Add Button */}
                        <div>
                          {quantity === 0 ? (
                            <button
                              onClick={() => addToCart(service)}
                              className="px-5 py-2 rounded-xl bg-[#4770DB] hover:bg-[#385cc4] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#4770DB]/20 active:scale-90 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          ) : (
                            <div className="flex items-center bg-[#0E1B4D] border-2 border-[#4770DB] rounded-xl overflow-hidden shadow-lg shadow-[#4770DB]/20">
                              <button
                                onClick={() => updateQuantity(service.id, quantity - 1)}
                                className="p-2 hover:bg-slate-800 text-white active:scale-90 transition-transform cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 text-xs font-mono font-black text-white">
                                {quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(service.id, quantity + 1)}
                                className="p-2 hover:bg-slate-800 text-white active:scale-90 transition-transform cursor-pointer"
                                aria-label="Increase quantity"
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
            )}
          </main>
        </div>
      </div>

      {/* ── Detail Modal (When user taps service) ─────── */}
      {selectedServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0E1B4D] rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
            <div className="relative h-48 sm:h-56">
              <img
                src={selectedServiceModal.image}
                alt={selectedServiceModal.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedServiceModal(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-3 bg-[#080D1A]/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20">
                {selectedServiceModal.categoryTitle}
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedServiceModal.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-emerald-400" /> {selectedServiceModal.rating} ({selectedServiceModal.reviewsCount} reviews)
                  </span>
                  <span>•</span>
                  <span>{selectedServiceModal.durationMinutes} mins service time</span>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedServiceModal.description}
              </p>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  What is included in this repair:
                </h4>
                <div className="space-y-2">
                  {selectedServiceModal.inclusions.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Reparzo 30-Day Guarantee
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Free rework if any issue persists within 30 days
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div>
                <span className="text-2xl font-mono font-black text-white">
                  ₹{selectedServiceModal.price}
                </span>
                <span className="text-xs font-mono text-slate-400 line-through ml-2">
                  ₹{selectedServiceModal.originalPrice}
                </span>
              </div>

              <button
                onClick={() => {
                  addToCart(selectedServiceModal);
                  setSelectedServiceModal(null);
                  setCartDrawerOpen(true);
                }}
                className="px-6 py-3 rounded-full bg-[#4770DB] hover:bg-[#385cc4] text-white text-xs font-bold active:scale-95 transition-all shadow-lg shadow-[#4770DB]/20"
              >
                Add to Cart & View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
