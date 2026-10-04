import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ArrowUpDown,
  Plus, 
  Minus, 
  X,
  Layers,
  Wind,
  Bike,
  Truck,
  Zap,
  Droplet,
  Shirt,
  Waves,
  Wrench,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Service, Category, CartItem } from '../types';

const ICON_MAP: Record<string, React.ElementType> = {
  Wind,
  Bike,
  Truck,
  Zap,
  Droplet,
  Sparkles,
  Shirt,
  Waves,
  Wrench,
  Layers,
  Shield,
};

export const ServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
    setCartDrawerOpen,
    location,
    setLocationModalOpen
  } = useAppStore();

  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating' | 'duration'>('popular');
  const [selectedServiceModal, setSelectedServiceModal] = useState<Service | null>(null);

  // Sync category from URL param
  useEffect(() => {
    if (categoryParam) {
      setActiveCategorySlug(categoryParam);
    }
  }, [categoryParam, setActiveCategorySlug]);

  // Open item modal if query param passed
  useEffect(() => {
    if (itemParam) {
      const match = services.find((s: Service) => s.slug === itemParam);
      if (match) {
        setSelectedServiceModal(match);
        if (!categoryParam && match.categorySlug) {
          setActiveCategorySlug(match.categorySlug);
        }
      }
    }
  }, [itemParam, categoryParam, services, setActiveCategorySlug]);

  const handleCloseServiceModal = () => {
    setSelectedServiceModal(null);
    if (searchParams.get('item')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('item');
      setSearchParams(newParams, { replace: true });
    }
  };

  const activeCategories: { id: string; title: string; slug: string; iconName: string }[] = [
    { id: 'all', title: 'All Services', slug: 'all', iconName: 'Layers' },
    ...categories.filter((c: Category) => c.isActive),
  ];

  const currentCategory = categories.find((c: Category) => c.slug === activeCategorySlug);

  // Handle switching category
  const handleSelectCategory = (slug: string) => {
    setActiveCategorySlug(slug);
    setSearchParams(slug === 'all' ? {} : { category: slug });
  };

  // Filter and sort services directly by category
  const displayedServices = useMemo(() => {
    const result = services.filter((srv: Service) => {
      return activeCategorySlug === 'all' || srv.categorySlug === activeCategorySlug;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    });
  }, [services, activeCategorySlug, sortBy]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-900">
      {/* ── Category Ribbon (Sticky Top Selector) ── */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs py-2 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full">
            {activeCategories.map((cat) => {
              const isSelected = activeCategorySlug === cat.slug;
              const Icon = ICON_MAP[cat.iconName] || Wrench;
              const catCount =
                cat.slug === 'all'
                  ? services.length
                  : services.filter((s: Service) => s.categorySlug === cat.slug).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={`relative px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 cursor-pointer transition-all duration-200 select-none flex-shrink-0 ${
                    isSelected
                      ? 'text-white font-extrabold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 bg-slate-50 border border-slate-200/60'
                  }`}
                >
                  {/* Smooth Animated Active Pill Background */}
                  {isSelected && (
                    <motion.div
                      layoutId="activeCategoryTopPill"
                      className="absolute inset-0 rounded-2xl bg-[#2563EB] shadow-md shadow-blue-500/25"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                    <span>{cat.title}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-500'
                      }`}
                    >
                      {catCount}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Services Area ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Compact Header Bar with Title & Sort */}
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              {activeCategorySlug === 'all' ? 'All Services' : currentCategory?.title}
            </h1>
            <span className="text-xs font-bold text-slate-400 font-mono">
              ({displayedServices.length})
            </span>
          </div>

          {/* Compact Sort Filter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline font-semibold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-xs"
            >
              <option value="popular">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="duration">Fastest Duration</option>
            </select>
          </div>
        </div>

        {/* ── Non-Serviceable Notice Banner (Fully readable & compact) ── */}
        {location.isServiceable === false && (
          <div className="mb-4 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-amber-50/95 border border-amber-200/90 text-amber-950 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
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
        )}

        {/* Zero State */}
        {displayedServices.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-500 shadow-xs">
            <Wrench className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No services available in this category</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Please check back soon or browse another service category.
            </p>
            <button
              onClick={() => handleSelectCategory('all')}
              className="mt-4 px-5 py-2.5 bg-[#2563EB] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#1d4ed8] cursor-pointer"
            >
              View All Services
            </button>
          </div>
        ) : (
          /* ── Grid of Services ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            <AnimatePresence mode="popLayout">
              {displayedServices.map((service: Service) => {
                const cartItem = cart.find((i: CartItem) => i.service.id === service.id);
                const quantity = cartItem?.quantity || 0;
                const discountPercent = Math.round(
                  ((service.originalPrice - service.price) / service.originalPrice) * 100
                );

                return (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-[#2563EB]/40 transition-all flex flex-col justify-between group shadow-xs hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div>
                      {/* Image Preview with Badges */}
                      <div 
                        onClick={() => setSelectedServiceModal(service)}
                        className="relative h-40 sm:h-44 rounded-2xl overflow-hidden mb-3 border border-slate-100 bg-slate-100 cursor-pointer"
                      >
                        <img
                          src={service.image}
                          alt={service.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Category Tag */}
                        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase text-[#2563EB] border border-slate-200 shadow-xs">
                          {service.subCategoryTitle || service.categoryTitle}
                        </div>

                        {/* Discount Percent Tag */}
                        {discountPercent > 0 && (
                          <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                            {discountPercent}% OFF
                          </div>
                        )}

                        {/* Duration Variable Pill */}
                        <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" /> {service.durationMinutes} mins
                        </div>
                      </div>

                      {/* Rating & Verified Reviews */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span className="text-xs font-bold text-amber-700">{service.rating}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          ({service.reviewsCount.toLocaleString()} verified bookings)
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

                      {/* Inclusions Feature Bullets */}
                      <div className="mt-3 space-y-1">
                        {(service.inclusions || []).slice(0, 2).map((feat: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer: Price & Add Stepper */}
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
                          Genuine Spares Included
                        </span>
                      </div>

                      {/* Add Button / Quantity Counter */}
                      <div>
                        {location.isServiceable === false ? (
                          <button
                            type="button"
                            disabled
                            className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs uppercase tracking-wider cursor-not-allowed flex items-center gap-1 select-none shadow-none"
                            title={`Service currently unavailable in ${location.area}. Coming soon!`}
                          >
                            <span>Unavailable</span>
                          </button>
                        ) : quantity === 0 ? (
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
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Detailed Service Inspection Modal ─────────── */}
      {selectedServiceModal && (
        <div 
          onClick={handleCloseServiceModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-200 cursor-default"
          >
            <div className="relative h-56 sm:h-64">
              <img
                src={selectedServiceModal.image}
                alt={selectedServiceModal.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleCloseServiceModal}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#2563EB] border border-slate-200">
                {selectedServiceModal.subCategoryTitle || selectedServiceModal.categoryTitle}
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="text-sm font-bold text-slate-900">{selectedServiceModal.rating}</span>
                  <span className="text-xs text-slate-400">({selectedServiceModal.reviewsCount} verified reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>{selectedServiceModal.durationMinutes} mins service time</span>
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
                  Verified Inclusions:
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
                    Genuine Spares & Expert Service Included
                  </span>
                </div>

                <button
                  disabled={location.isServiceable === false}
                  onClick={() => {
                    if (location.isServiceable === false) return;
                    addToCart(selectedServiceModal);
                    handleCloseServiceModal();
                    setCartDrawerOpen(true);
                  }}
                  className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                    location.isServiceable === false
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none select-none'
                      : 'bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer'
                  }`}
                >
                  {location.isServiceable === false ? 'Service Unavailable (Coming Soon)' : 'Book Service Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
