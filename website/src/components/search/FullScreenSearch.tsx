import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  ArrowLeft, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  Star, 
  Plus, 
  Minus, 
  Check, 
  Flame, 
  Mic,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useNavigate } from 'react-router-dom';

export const FullScreenSearch: React.FC = () => {
  const { 
    isSearchOpen, 
    setSearchOpen, 
    searchQuery, 
    setSearchQuery, 
    recentSearches, 
    addRecentSearch, 
    clearRecentSearches,
    services,
    categories,
    cart,
    addToCart,
    updateQuantity,
    setActiveCategorySlug
  } = useAppStore();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input automatically when opened
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'auto';
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isSearchOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  if (!isSearchOpen) return null;

  // Filter services based on query and optional category filter
  const filteredServices = services.filter((service) => {
    const matchesQuery =
      searchQuery.trim() === '' ||
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.categoryTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategoryFilter === 'all' || service.categorySlug === activeCategoryFilter;

    return matchesQuery && matchesCategory;
  });

  const handleSelectService = (slug: string, categorySlug: string) => {
    addRecentSearch(searchQuery || serviceTitleBySlug(slug));
    setSearchOpen(false);
    setActiveCategorySlug(categorySlug);
    navigate(`/services?item=${slug}`);
  };

  const serviceTitleBySlug = (slug: string) => {
    return services.find((s) => s.slug === slug)?.title || slug;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
    }
  };

  const triggerVoiceSearch = () => {
    setIsListening(true);
    // Simulating quick voice capture for rapid UX
    setTimeout(() => {
      setSearchQuery('AC Foam Jet Deep Service');
      setIsListening(false);
    }, 1200);
  };

  const trendingTags = [
    'AC Foam Jet Service',
    'Doorstep Bike Service',
    'MCB Tripping Fix',
    'Tap Leakage Repair',
    '1 BHK Home Relocation',
    'Refrigerator Cooling',
    'Water Tank UV Wash'
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-[#080D1A]/95 backdrop-blur-2xl flex flex-col text-slate-100 overflow-hidden"
      >
        {/* ── Top Search Bar Header ─────────────────────── */}
        <div className="border-b border-slate-800/80 bg-[#0E1B4D]/60 pt-safe px-4 sm:px-6 lg:px-8 pb-4 shadow-xl">
          <div className="max-w-4xl mx-auto flex items-center gap-3 pt-3">
            {/* Back Button */}
            <button
              onClick={() => setSearchOpen(false)}
              className="p-2.5 rounded-full hover:bg-white/10 active:scale-95 transition-all text-slate-300 hover:text-white"
              aria-label="Close search"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Form Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-[#4770DB] absolute left-4 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for 'AC service', 'Bike mechanic', 'Plumber'..."
                  className="w-full pl-12 pr-20 py-3.5 sm:py-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 focus:border-[#4770DB] focus:ring-4 focus:ring-[#4770DB]/20 text-white placeholder-slate-400 text-base sm:text-lg font-medium outline-none transition-all shadow-inner"
                />

                {/* Right Actions: Voice & Clear */}
                <div className="absolute right-3 flex items-center gap-1.5">
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 transition-transform"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={triggerVoiceSearch}
                      className={`p-2 rounded-xl transition-all ${
                        isListening
                          ? 'bg-[#E32402] text-white animate-pulse'
                          : 'text-slate-400 hover:text-[#4770DB] hover:bg-slate-800'
                      }`}
                      title="Voice Search"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Quick Cancel text on desktop */}
            <button
              onClick={() => setSearchOpen(false)}
              className="hidden sm:block text-sm font-semibold text-slate-400 hover:text-white px-2 py-2"
            >
              Cancel
            </button>
          </div>

          {/* Quick Category Chips */}
          <div className="max-w-4xl mx-auto flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategoryFilter === 'all'
                  ? 'bg-[#4770DB] text-white shadow-md shadow-[#4770DB]/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              All Services
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.slug)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategoryFilter === cat.slug
                    ? 'bg-[#4770DB] text-white shadow-md shadow-[#4770DB]/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body: Content Area ────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Case A: Query is Active ➔ Live Filtered Results */}
            {searchQuery.trim() !== '' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    {filteredServices.length} Results for "{searchQuery}"
                  </h3>
                  <span className="text-xs text-[#4770DB] font-medium flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Doorstep Arrival in 60 Mins
                  </span>
                </div>

                {filteredServices.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl glass-panel border border-slate-800">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <Search className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">No repair service found</h4>
                    <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                      We couldn't find an exact match for "{searchQuery}". Try searching for generic items like "AC", "Bike", or "Wiring".
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-6 py-2.5 rounded-full bg-[#4770DB] text-white text-sm font-bold hover:bg-[#3b5ec2] active:scale-95 transition-transform"
                    >
                      Clear Search Query
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredServices.map((service) => {
                      const cartItem = cart.find((i) => i.service.id === service.id);
                      const quantity = cartItem?.quantity || 0;

                      return (
                        <div
                          key={service.id}
                          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-[#4770DB]/50 transition-all flex gap-3.5 items-center justify-between group"
                        >
                          <div 
                            className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
                            onClick={() => handleSelectService(service.slug, service.categorySlug)}
                          >
                            <img
                              src={service.image}
                              alt={service.title}
                              className="w-16 h-16 rounded-xl object-cover border border-slate-700/60 group-hover:scale-105 transition-transform flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-[#4770DB] uppercase tracking-wider block">
                                {service.categoryTitle}
                              </span>
                              <h4 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                                {service.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-mono font-bold text-white">
                                  ₹{service.price}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400 line-through">
                                  ₹{service.originalPrice}
                                </span>
                                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-emerald-400" /> {service.rating}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Interactive Add or Quantity Button */}
                          <div className="flex-shrink-0">
                            {quantity === 0 ? (
                              <button
                                onClick={() => addToCart(service)}
                                className="px-3 py-1.5 rounded-lg bg-[#4770DB] hover:bg-[#3c61c7] active:scale-90 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-md flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </button>
                            ) : (
                              <div className="flex items-center bg-slate-800 border border-[#4770DB] rounded-lg overflow-hidden shadow-sm">
                                <button
                                  onClick={() => updateQuantity(service.id, quantity - 1)}
                                  className="p-1.5 hover:bg-slate-700 text-slate-300 active:scale-90 transition-transform"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-2 text-xs font-mono font-bold text-white">
                                  {quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(service.id, quantity + 1)}
                                  className="p-1.5 hover:bg-slate-700 text-slate-300 active:scale-90 transition-transform"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Case B: Query is Empty ➔ Recent Searches, Trending, & Categories */
              <div className="space-y-8">
                {/* 1. Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Recent Searches</span>
                      </div>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSearchQuery(term)}
                          className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-2 group transition-all"
                        >
                          <Search className="w-3 h-3 text-slate-500 group-hover:text-[#4770DB]" />
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Trending Searches (Blinkit Style) */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Popular & Trending Today</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {trendingTags.map((tag, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSearchQuery(tag)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-slate-900 to-[#0E1B4D]/60 border border-slate-800/80 hover:border-[#4770DB]/50 text-slate-200 text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all shadow-sm"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Explore Top Categories */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Browse by Category
                    </span>
                    <button
                      onClick={() => {
                        setSearchOpen(false);
                        navigate('/services');
                      }}
                      className="text-xs font-semibold text-[#4770DB] hover:underline flex items-center gap-1"
                    >
                      View All <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {categories.slice(0, 8).map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setSearchOpen(false);
                          setActiveCategorySlug(cat.slug);
                          navigate(`/services?category=${cat.slug}`);
                        }}
                        className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-[#4770DB]/40 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {cat.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-[#4770DB] font-semibold">
                            {cat.badge || 'Verified'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {cat.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Trust Assurance Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0E1B4D]/60 via-slate-900 to-[#0E1B4D]/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Reparzo Trust Guarantee</h5>
                      <p className="text-[11px] text-slate-400">All services covered with 30-day post-service warranty</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    4.9 ★ Rating
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
