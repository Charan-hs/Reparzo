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
  ChevronRight,
  X
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
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-900">
      {/* ── Page Header Strip ─────────────────────────── */}
      <div className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Reparzo Verified Catalog
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 30-Day Post-Repair Warranty
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Professional Home & Vehicle Repair
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Main Dual-Rail Layout (Blinkit Style) ──────── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* 1. Left Sticky Rail: Categories */}
          <aside className="w-full md:w-64 flex-shrink-0 md:sticky md:top-24 z-20">
            <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
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
                          ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{cat.title}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono ml-2 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
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

          {/* 2. Right Main Grid: Services */}
          <main className="flex-1 w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 capitalize">
                  {activeCategorySlug === 'all'
                    ? 'All Verified Services'
                    : categories.find((c: Category) => c.slug === activeCategorySlug)?.title}
                </h2>
                <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {displayedServices.length} found
                </span>
              </div>
            </div>

            {displayedServices.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-500">
                <Search className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                <h3 className="text-base font-bold text-slate-800">No matching services found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try searching with generic terms like "ac", "water", "bike", or choose another category from the left.
                </p>
                <button
                  onClick={() => {
                    setSearchFilter('');
                    setActiveCategorySlug('all');
                  }}
                  className="mt-4 px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedServices.map((service: Service) => {
                  const cartItem = cart.find((i: CartItem) => i.service.id === service.id);
                  const quantity = cartItem?.quantity || 0;

                  return (
                    <div
                      key={service.id}
                      className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-[#2563EB]/40 transition-all flex flex-col justify-between group shadow-xs hover:shadow-xl hover:-translate-y-1"
                    >
                      <div>
                        {/* Image Preview & Category Badge */}
                        <div 
                          onClick={() => setSelectedServiceModal(service)}
                          className="relative h-44 rounded-2xl overflow-hidden mb-3 border border-slate-100 bg-slate-100 cursor-pointer"
                        >
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
                        </div>

                        {/* Rating Row */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span className="text-xs font-bold text-amber-700">{service.rating}</span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            ({service.reviewsCount} reviews)
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 
                          onClick={() => setSelectedServiceModal(service)}
                          className="text-base font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors line-clamp-1 cursor-pointer"
                        >
                          {service.title}
                        </h3>

                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {service.description}
                        </p>

                        {/* Service Highlights / Bullet points */}
                        <div className="mt-3 space-y-1">
                          {(service.inclusions || []).slice(0, 2).map((feat: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer: Price & Add to Cart Counter */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-mono font-black text-slate-900">
                              ₹{service.price}
                            </span>
                            <span className="text-xs font-mono text-slate-400 line-through">
                              ₹{service.originalPrice}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 block">
                            30-Day Warranty
                          </span>
                        </div>

                        {/* Blinkit Quick Add Button / Counter */}
                        <div>
                          {quantity === 0 ? (
                            <button
                              onClick={() => addToCart(service)}
                              className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-[#2563EB] text-[#2563EB] hover:text-white border border-[#2563EB]/40 font-extrabold text-xs uppercase tracking-wider active:scale-90 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          ) : (
                            <div className="flex items-center bg-[#2563EB] border border-[#2563EB] rounded-xl overflow-hidden shadow-sm">
                              <button
                                onClick={() => updateQuantity(service.id, quantity - 1)}
                                className="p-1.5 hover:bg-blue-700 text-white active:scale-90 transition-transform cursor-pointer"
                                aria-label="Decrease"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2 text-xs font-mono font-bold text-white">
                                {quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(service.id, quantity + 1)}
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
            )}
          </main>
        </div>
      </div>

      {/* ── Detailed Service Inspection Modal ─────────── */}
      {selectedServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden text-slate-900">
            <div className="relative h-56 sm:h-64">
              <img
                src={selectedServiceModal.image}
                alt={selectedServiceModal.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedServiceModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#2563EB] border border-slate-200">
                {selectedServiceModal.categoryTitle}
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="text-sm font-bold text-slate-900">{selectedServiceModal.rating}</span>
                  <span className="text-xs text-slate-400">({selectedServiceModal.reviewsCount} verified customer reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>{selectedServiceModal.durationMinutes} mins</span>
                </div>
              </div>

              <h2 className="text-xl font-black text-slate-900 mb-2">
                {selectedServiceModal.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
                {selectedServiceModal.description}
              </p>

              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  What is included:
                </h4>
                {(selectedServiceModal.inclusions || []).map((feat: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono font-black text-slate-900">
                      ₹{selectedServiceModal.price}
                    </span>
                    <span className="text-sm font-mono text-slate-400 line-through">
                      ₹{selectedServiceModal.originalPrice}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    30-Day Free Rework Warranty Included
                  </span>
                </div>

                <button
                  onClick={() => {
                    addToCart(selectedServiceModal);
                    setSelectedServiceModal(null);
                    setCartDrawerOpen(true);
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  Book Service Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
