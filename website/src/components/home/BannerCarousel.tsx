import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Clock, 
  Flame,
  Zap,
  Tag
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface BannerSlide {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  highlight: string;
  price: string;
  originalPrice: string;
  categorySlug: string;
  targetSlug: string;
  ctaText: string;
  bgGradient: string;
  accentColor: string;
  image: string;
}

const BANNER_SLIDES: BannerSlide[] = [
  {
    id: 'banner-ac',
    badge: '⚡ FLASH SALE • 50% OFF',
    badgeColor: 'bg-[#E32402] text-white',
    title: 'AC Foam Jet Deep Clean',
    subtitle: 'High pressure 2X deeper coil wash & gas check. Cut your summer electricity bill by 25%.',
    highlight: '60 Min Doorstep Arrival',
    price: '₹499',
    originalPrice: '₹899',
    categorySlug: 'ac-services',
    targetSlug: 'ac-foam-jet-service',
    ctaText: 'Book AC Service',
    bgGradient: 'from-[#0E1B4D] via-[#162766] to-[#0A1230]',
    accentColor: '#4770DB',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'banner-bike',
    badge: '🛵 DOORSTEP MAINTENANCE',
    badgeColor: 'bg-emerald-500 text-white',
    title: 'Doorstep Bike General Service',
    subtitle: 'Complete 24-point safety check, engine oil change, brake pad overhaul & chain lube.',
    highlight: 'Free Pressure Foam Wash',
    price: '₹349',
    originalPrice: '₹599',
    categorySlug: 'bike-service',
    targetSlug: 'bike-doorstep-general-service',
    ctaText: 'Tune My Bike',
    bgGradient: 'from-[#0E1B4D] via-[#1e1b4b] to-[#0A1230]',
    accentColor: '#6366F1',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'banner-elec',
    badge: '⚡ CERTIFIED ELECTRICIAN',
    badgeColor: 'bg-amber-500 text-slate-950 font-extrabold',
    title: 'Short Circuit & MCB Tripping',
    subtitle: 'Immediate master technician dispatch for power cuts, burning smell & breaker issues.',
    highlight: 'Arrival in 30–45 Mins',
    price: '₹249',
    originalPrice: '₹399',
    categorySlug: 'electrical-services',
    targetSlug: 'mcb-wiring-short-circuit-fix',
    ctaText: 'Fix Wiring Now',
    bgGradient: 'from-[#0E1B4D] via-[#241a45] to-[#0A1230]',
    accentColor: '#F59E0B',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'banner-shift',
    badge: '📦 VERIFIED MOVERS',
    badgeColor: 'bg-blue-600 text-white',
    title: '1 BHK Intra-City Home Shifting',
    subtitle: 'Dedicated truck, verified packers, 3-layer bubble wrapping & zero damage transit.',
    highlight: 'Toll & Fuel Included',
    price: '₹3,499',
    originalPrice: '₹4,500',
    categorySlug: 'home-shifting',
    targetSlug: 'home-shifting-1bhk',
    ctaText: 'Schedule Move',
    bgGradient: 'from-[#0E1B4D] via-[#152e4d] to-[#0A1230]',
    accentColor: '#38BDF8',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'banner-tank',
    badge: '💧 HYGIENE ASSURED',
    badgeColor: 'bg-teal-500 text-white',
    title: 'Water Tank Deep UV Cleaning',
    subtitle: 'Mechanised 6-stage slurry suction, rotary pressure jet wash & microbial UV wand sanitization.',
    highlight: 'Up to 1000L Sump / Overhead',
    price: '₹699',
    originalPrice: '₹1,199',
    categorySlug: 'water-tank-services',
    targetSlug: 'underground-overhead-water-tank',
    ctaText: 'Clean Water Tank',
    bgGradient: 'from-[#0E1B4D] via-[#133740] to-[#0A1230]',
    accentColor: '#14B8A6',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
  },
];

export const BannerCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const { setActiveCategorySlug } = useAppStore();

  // Infinite smooth interval (pauses on hover/touch)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleSlideClick = (slide: BannerSlide) => {
    setActiveCategorySlug(slide.categorySlug);
    navigate(`/services?item=${slide.targetSlug}`);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % BANNER_SLIDES.length);
  };

  const activeSlide = BANNER_SLIDES[currentIndex];

  return (
    <section 
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/70 double-bezel">
        <div className="double-bezel-inner relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => handleSlideClick(activeSlide)}
              className={`w-full min-h-[260px] sm:min-h-[340px] md:min-h-[380px] bg-gradient-to-r ${activeSlide.bgGradient} p-5 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer select-none group relative overflow-hidden`}
            >
              {/* Background ambient decorative orb */}
              <div 
                className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-[100px] opacity-40 pointer-events-none"
                style={{ backgroundColor: activeSlide.accentColor }}
              />

              {/* Left Content Column */}
              <div className="flex-1 max-w-xl z-10 text-left">
                {/* Badge Pill */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${activeSlide.badgeColor} shadow-md`}>
                    <Flame className="w-3.5 h-3.5" />
                    {activeSlide.badge}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-cyan-300 font-semibold bg-white/10 px-2.5 py-0.5 rounded-full">
                    <Clock className="w-3 h-3 text-cyan-400" /> {activeSlide.highlight}
                  </span>
                </div>

                {/* Banner Headline */}
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1] group-hover:text-cyan-200 transition-colors">
                  {activeSlide.title}
                </h2>

                <p className="mt-2 sm:mt-3 text-xs sm:text-base text-slate-300 line-clamp-2 leading-relaxed max-w-lg">
                  {activeSlide.subtitle}
                </p>

                {/* Price & CTA Action */}
                <div className="mt-5 sm:mt-7 flex items-center gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-mono font-black text-white">
                      {activeSlide.price}
                    </span>
                    <span className="text-sm sm:text-base font-mono text-slate-400 line-through">
                      {activeSlide.originalPrice}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSlideClick(activeSlide);
                    }}
                    className="px-5 sm:px-7 py-3 rounded-full bg-[#4770DB] hover:bg-[#385cc4] text-white text-xs sm:text-sm font-bold shadow-xl shadow-[#4770DB]/30 flex items-center gap-2 group/btn active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{activeSlide.ctaText}</span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Right Media Graphic */}
              <div className="relative z-10 w-full md:w-auto flex justify-center md:justify-end">
                <div className="relative w-48 h-36 sm:w-72 sm:h-52 md:w-80 md:h-64 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={activeSlide.image}
                    alt={activeSlide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700/80">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>30 Days Warranty Included</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Desktop Left / Right Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#080D1A]/80 hover:bg-[#080D1A] text-white border border-white/20 hidden sm:flex items-center justify-center shadow-lg active:scale-90 transition-all cursor-pointer"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#080D1A]/80 hover:bg-[#080D1A] text-white border border-white/20 hidden sm:flex items-center justify-center shadow-lg active:scale-90 transition-all cursor-pointer"
            aria-label="Next banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {BANNER_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx
                    ? 'w-6 h-2 bg-[#4770DB] shadow-md'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
