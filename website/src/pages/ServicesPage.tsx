import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Tag,
  IndianRupee,
  Shield,
  SlidersHorizontal
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { Service, Category, SubCategory, CartItem } from '../types';

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
  const subCategoryParam = searchParams.get('sub');
  const itemParam = searchParams.get('item');

  const { 
    services, 
    categories, 
    activeCategorySlug, 
    setActiveCategorySlug,
    subCategories,
    activeSubCategorySlug,
    setActiveSubCategorySlug,
    cart,
    addToCart,
    updateQuantity,
    setCartDrawerOpen
  } = useAppStore();

  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating' | 'duration'>('popular');
  const [selectedServiceModal, setSelectedServiceModal] = useState<Service | null>(null);

  // Sync category & subcategory from URL params
  useEffect(() => {
    if (categoryParam) {
      setActiveCategorySlug(categoryParam);
    }
  }, [categoryParam, setActiveCategorySlug]);

  useEffect(() => {
    if (subCategoryParam) {
      setActiveSubCategorySlug(subCategoryParam);
    }
  }, [subCategoryParam, setActiveSubCategorySlug]);

  // Open item modal if query param passed
  useEffect(() => {
    if (itemParam) {
      const match = services.find((s: Service) => s.slug === itemParam);
      if (match) setSelectedServiceModal(match);
    }
  }, [itemParam, services]);

  const activeCategories: { id: string; title: string; slug: string; iconName: string; badge?: string }[] = [
    { id: 'all', title: 'All Services', slug: 'all', iconName: 'Layers', badge: 'All-in-One' },
    ...categories.filter((c: Category) => c.isActive),
  ];

  const currentCategory = categories.find((c: Category) => c.slug === activeCategorySlug);

  // Subcategories belonging to the currently selected category
  const availableSubCategories = useMemo(() => {
    if (activeCategorySlug === 'all') {
      return subCategories.filter((s: SubCategory) => s.isActive);
    }
    return subCategories.filter(
      (s: SubCategory) => 
        (s.categorySlug === activeCategorySlug || s.categoryId === currentCategory?.id) && 
        s.isActive
    );
  }, [subCategories, activeCategorySlug, currentCategory]);

  const currentSubCategory = availableSubCategories.find((s) => s.slug === activeSubCategorySlug);

  // Handle switching parent category (Step 1)
  const handleSelectCategory = (slug: string) => {
    setActiveCategorySlug(slug);
    setActiveSubCategorySlug('all');
    setSearchParams(slug === 'all' ? {} : { category: slug });
  };

  // Handle switching subcategory (Step 2 - Left Rail)
  const handleSelectSubCategory = (slug: string) => {
    setActiveSubCategorySlug(slug);
    const params: Record<string, string> = {};
    if (activeCategorySlug !== 'all') params.category = activeCategorySlug;
    if (slug !== 'all') params.sub = slug;
    setSearchParams(params);
  };

  // Filter and sort services
  const displayedServices = useMemo(() => {
    let result = services.filter((srv: Service) => {
      // 1. Parent Category filter
      const matchesCategory =
        activeCategorySlug === 'all' || srv.categorySlug === activeCategorySlug;

      // 2. SubCategory filter
      const matchesSubCategory =
        activeSubCategorySlug === 'all' ||
        srv.subCategorySlug === activeSubCategorySlug ||
        srv.slug === activeSubCategorySlug;

      // 3. Search query filter
      const matchesSearch =
        searchFilter.trim() === '' ||
        srv.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        srv.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
        srv.categoryTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (srv.subCategoryTitle && srv.subCategoryTitle.toLowerCase().includes(searchFilter.toLowerCase()));

      return matchesCategory && matchesSubCategory && matchesSearch;
    });

    // Fallback: If no direct service matches a specific newly created subcategory, synthesize a card from the subcategory itself!
    if (result.length === 0 && activeSubCategorySlug !== 'all' && currentSubCategory) {
      const synthesizedService: Service = {
        id: `synth-${currentSubCategory.id}`,
        slug: currentSubCategory.slug,
        title: currentSubCategory.title,
        categorySlug: currentSubCategory.categorySlug,
        categoryTitle: currentCategory?.title || 'Verified Service',
        subCategorySlug: currentSubCategory.slug,
        subCategoryTitle: currentSubCategory.title,
        description: currentSubCategory.description,
        price: currentSubCategory.startingPrice,
        originalPrice: currentSubCategory.originalPrice || Math.round(currentSubCategory.startingPrice * 1.4),
        durationMinutes: currentSubCategory.durationMinutes,
        rating: 4.88,
        reviewsCount: 1420,
        inclusions: currentSubCategory.features || [
          'Doorstep arrival with complete toolkit',
          'Standardized rate card & transparent pricing',
          `${currentSubCategory.warrantyDays}-day post service rework warranty`,
        ],
        warrantyDays: currentSubCategory.warrantyDays,
        image: '/banners/banner-1.png',
        isPopular: true,
      };
      result = [synthesizedService];
    }

    // Apply Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    });
  }, [services, activeCategorySlug, activeSubCategorySlug, searchFilter, sortBy, currentSubCategory, currentCategory]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-900">
      {/* ── Top Page Header Strip ─────────────────────────── */}
      <div className="bg-white border-b border-slate-200 py-5 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Reparzo Verified Catalog
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 30-Day Post-Repair Warranty
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                ⚡ Standardized Doorstep Rates
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {activeCategorySlug === 'all'
                ? 'All Services & Standardized Rate Cards'
                : currentCategory?.title || 'Professional Doorstep Repair'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select a category and subcategory from the left rail to view transparent price lists, SLA timings, and verified technicians.
            </p>
          </div>

          {/* Quick Search Input */}
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by problem (e.g., cooling, leak, oil, mcb)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── STEP 1: Top Category Ribbon (Blinkit Style Parent Selector) ── */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs py-2 px-3 sm:px-6 lg:px-8">
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

      {/* ── STEP 2: Main Dual-Rail Layout (Blinkit 2-Step Hierarchy) ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* ── LEFT STATIC RAIL: Subcategories List (Blinkit Style) ── */}
          <aside className="w-full md:w-72 flex-shrink-0 md:sticky md:top-36 z-20">
            <div className="p-3 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
              {/* Rail Header */}
              <div className="px-2.5 py-2 mb-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Step 2: Subcategories
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 truncate">
                    {activeCategorySlug === 'all' ? 'All Subcategories' : currentCategory?.title}
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200">
                  {availableSubCategories.length} items
                </span>
              </div>

              {/* Subcategories Vertical List (Static on Desktop, Horizontal Pill on Mobile) */}
              <div className="flex md:flex-col gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                {/* "All" Item */}
                <button
                  onClick={() => handleSelectSubCategory('all')}
                  className={`relative p-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer select-none flex-shrink-0 md:flex-shrink md:w-full flex items-center justify-between ${
                    activeSubCategorySlug === 'all'
                      ? 'text-white font-bold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 bg-slate-50/60'
                  }`}
                >
                  {activeSubCategorySlug === 'all' && (
                    <motion.div
                      layoutId="activeSubcategoryRailPill"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#2563EB] to-blue-700 shadow-md shadow-blue-500/25"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2.5 truncate">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        activeSubCategorySlug === 'all' ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#2563EB]'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold truncate">All In Category</div>
                      <div
                        className={`text-[10px] ${
                          activeSubCategorySlug === 'all' ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        Complete rate cards
                      </div>
                    </div>
                  </div>
                  <span
                    className={`relative z-10 text-[10px] font-mono px-2 py-0.5 rounded-full ml-2 ${
                      activeSubCategorySlug === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {activeCategorySlug === 'all'
                      ? services.length
                      : services.filter((s) => s.categorySlug === activeCategorySlug).length}
                  </span>
                </button>

                {/* Subcategory Items */}
                {availableSubCategories.map((sub: SubCategory) => {
                  const isSelected = activeSubCategorySlug === sub.slug;
                  const Icon = ICON_MAP[sub.iconName || ''] || Wrench;
                  const count = services.filter(
                    (s: Service) => s.subCategorySlug === sub.slug || s.slug === sub.slug
                  ).length;

                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSelectSubCategory(sub.slug)}
                      className={`relative p-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer select-none flex-shrink-0 md:flex-shrink md:w-full flex items-center justify-between border ${
                        isSelected
                          ? 'border-transparent text-white font-bold'
                          : 'border-slate-100 hover:border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      {/* Smooth Active Indicator Pill */}
                      {isSelected && (
                        <motion.div
                          layoutId="activeSubcategoryRailPill"
                          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#2563EB] to-blue-700 shadow-md shadow-blue-500/25"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}

                      <div className="relative z-10 flex items-center gap-2.5 truncate">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#2563EB]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>

                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold truncate">{sub.title}</span>
                          </div>

                          {/* Variables Row in Left Rail */}
                          <div
                            className={`flex items-center gap-1.5 text-[10px] mt-0.5 ${
                              isSelected ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            <span className="font-semibold">Starts ₹{sub.startingPrice}</span>
                            <span>•</span>
                            <span>{sub.durationMinutes}m</span>
                            {sub.badge && (
                              <>
                                <span>•</span>
                                <span
                                  className={`px-1.5 py-0.2 rounded-md text-[9px] font-extrabold uppercase ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {sub.badge}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`relative z-10 text-[10px] font-mono px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {count > 0 ? count : 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Static Rail Footer Guarantee */}
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 hidden md:flex items-center gap-2 px-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Zero visiting fee on service approval.</span>
              </div>
            </div>
          </aside>

          {/* ── RIGHT MAIN PANEL: Services & Rate Cards (All Variables) ── */}
          <main className="flex-1 w-full min-w-0">
            {/* Active Subcategory Context Banner */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs mb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <span>Reparzo Catalog</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="font-medium text-slate-600">
                      {activeCategorySlug === 'all' ? 'All Services' : currentCategory?.title}
                    </span>
                    {activeSubCategorySlug !== 'all' && currentSubCategory && (
                      <>
                        <ChevronRight className="w-3 h-3" />
                        <span className="font-bold text-[#2563EB]">{currentSubCategory.title}</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                    <span>
                      {activeSubCategorySlug === 'all'
                        ? currentCategory?.title || 'All Verified Services'
                        : currentSubCategory?.title}
                    </span>
                    {currentSubCategory?.badge && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        {currentSubCategory.badge}
                      </span>
                    )}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    {currentSubCategory?.description ||
                      currentCategory?.description ||
                      'Genuine spare parts, transparent labour rates, and doorstep delivery by background-verified technicians.'}
                  </p>
                </div>

                {/* Sort Filter Selector */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold">Sort:</span>
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
              </div>

              {/* Key Variables Assurance Strip */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 sm:gap-6 flex-wrap text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  30-Day Free Rework Warranty
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Doorstep Arrival in 60-90 Mins
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  100% Genuine Certified Spares
                </span>
              </div>
            </div>

            {/* Zero State */}
            {displayedServices.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-500 shadow-xs">
                <Search className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-800">No matching services found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try searching with generic terms like "cooling", "leak", "oil", or choose another subcategory from the left rail.
                </p>
                <button
                  onClick={() => {
                    setSearchFilter('');
                    setActiveSubCategorySlug('all');
                  }}
                  className="mt-4 px-5 py-2.5 bg-[#2563EB] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#1d4ed8] cursor-pointer"
                >
                  Reset Rail Filters
                </button>
              </div>
            ) : (
              /* ── Grid of Services Showing ALL Variables ── */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                          {/* Image Preview with Badges & Variables */}
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

                            {/* SubCategory / Category Badge */}
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

                        {/* Footer: Price Variables & Blinkit Add Counter */}
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
                              {service.warrantyDays}-Day Warranty Included
                            </span>
                          </div>

                          {/* Blinkit Interactive Add Button / Quantity Counter */}
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
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Detailed Service Inspection Modal ─────────── */}
      {selectedServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-200">
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
                    {selectedServiceModal.warrantyDays}-Day Free Rework Warranty Included
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
