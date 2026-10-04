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
    setActiveCategorySlug,
    location
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
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        addRecentSearch(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      alert('Speech recognition is not supported in this browser. Please type your search.');
    }
  };

  const POPULAR_SEARCH_TERMS = [
    'AC Foam Jet Deep Wash',
    'Doorstep Bike Oil Change',
    'Short Circuit & MCB Fix',
    'Tap Leak Repair',
    '1 BHK Home Shifting',
    'Water Tank UV Wash'
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-white/98 backdrop-blur-2xl flex flex-col text-slate-900 overflow-hidden"
      >
        {/* ── Top Search Bar Header ─────────────────────── */}
        <div className="border-b border-slate-200 bg-white pt-safe px-4 sm:px-6 lg:px-8 pb-4 shadow-xs">
          <div className="max-w-4xl mx-auto flex items-center gap-3 pt-3">
            {/* Back Button */}
            <button
              onClick={() => setSearchOpen(false)}
              className="p-2.5 rounded-full hover:bg-slate-100 active:scale-95 transition-all text-slate-600 hover:text-slate-900 cursor-pointer"
              aria-label="Close search"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Form Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-[#2563EB] absolute left-4 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for 'AC service', 'Bike mechanic', 'Plumber'..."
                  className="w-full pl-12 pr-20 py-3.5 sm:py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 text-slate-900 placeholder-slate-400 text-base sm:text-lg font-medium outline-none transition-all shadow-inner"
                />

                {/* Right Actions: Voice & Clear */}
                <div className="absolute right-3 flex items-center gap-1.5">
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1.5 rounded-full bg-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-300 active:scale-95 transition-transform cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={triggerVoiceSearch}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        isListening
                          ? 'bg-[#E32402] text-white animate-pulse'
                          : 'text-slate-400 hover:text-[#2563EB] hover:bg-slate-100'
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
              className="hidden sm:block text-sm font-semibold text-slate-500 hover:text-slate-900 px-2 py-2 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Quick Category Chips */}
          <div className="max-w-4xl mx-auto flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategoryFilter === 'all'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              All Services
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.slug)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategoryFilter === cat.slug
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* ── Search Body Content ──────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#F8FAFC]">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* If user hasn't typed anything yet, show Recents & Trending */}
            {!searchQuery.trim() && (
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Recent Searches</span>
                      </div>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                      >
                        Clear History
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSearchQuery(term)}
                          className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Trending Suggestions */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    <TrendingUp className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Popular on Reparzo Today</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCH_TERMS.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSearchQuery(term)}
                        className="px-3.5 py-1.5 rounded-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs font-medium text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Results Header */}
            {searchQuery.trim() && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Matching Services ({filteredServices.length})
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine Spare Parts
                </span>
              </div>
            )}

            {/* Service Result Cards List */}
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {filteredServices.map((service) => {
                  const cartItem = cart.find((i) => i.service.id === service.id);
                  const quantity = cartItem?.quantity || 0;

                  return (
                    <div
                      key={service.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-lg transition-all flex items-center justify-between gap-4 group"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div 
                        onClick={() => handleSelectService(service.slug, service.categorySlug)}
                        className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                      >
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-100 flex-shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB] block">
                            {service.categoryTitle}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#2563EB] transition-colors">
                            {service.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-mono font-black text-slate-900">
                              ₹{service.price}
                            </span>
                            <span className="text-xs font-mono text-slate-400 line-through">
                              ₹{service.originalPrice}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" /> {service.durationMinutes}m
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: + ADD Counter */}
                      <div className="flex-shrink-0">
                        {location.isServiceable === false ? (
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
                            onClick={() => addToCart(service)}
                            className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-[#2563EB] text-[#2563EB] hover:text-white border border-[#2563EB]/40 font-bold text-xs uppercase tracking-wider shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        ) : (
                          <div className="flex items-center bg-[#2563EB] border border-[#2563EB] rounded-xl overflow-hidden shadow-xs">
                            <button
                              onClick={() => updateQuantity(service.id, quantity - 1)}
                              className="p-1.5 hover:bg-blue-700 text-white active:scale-90 transition-transform cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-xs font-mono font-bold text-white">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(service.id, quantity + 1)}
                              className="p-1.5 hover:bg-blue-700 text-white active:scale-90 transition-transform cursor-pointer"
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
            ) : (
              <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-500">
                <Search className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <h3 className="text-base font-bold text-slate-800">
                  No repairs found for "{searchQuery}"
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try typing "AC", "Bike", "Electrical", "Water Tank", or "Shifting" to see available doorstep packages.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
