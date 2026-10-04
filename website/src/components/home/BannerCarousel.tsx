import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Flame,
  ShieldCheck,
  Edit3,
  X,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  Sparkles,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../../store/useAppStore';
import { ImageUploader } from '../admin/ImageUploader';

export interface BannerSlide {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  highlight?: string;
  price: string;
  originalPrice: string;
  categorySlug: string;
  targetSlug: string;
  ctaText: string;
  image: string;
}

export const DEFAULT_BANNER_SLIDES: BannerSlide[] = [
  {
    id: 'banner-ac',
    badge: '⚡ FLASH SALE • 50% OFF',
    badgeColor: 'bg-[#E32402] text-white',
    title: 'AC Foam Jet Deep Service',
    subtitle: 'High pressure 2X deeper coil wash & gas check. Cut summer electricity bill by 25%.',
    highlight: '60 Min Doorstep Arrival',
    price: '₹499',
    originalPrice: '₹899',
    categorySlug: 'ac-services',
    targetSlug: 'ac-foam-jet-service',
    ctaText: 'Book AC Service',
    image: '/banners/ac-service.jpg',
  },
  {
    id: 'banner-bike',
    badge: '🛵 DOORSTEP MAINTENANCE',
    badgeColor: 'bg-emerald-500 text-white',
    title: 'Doorstep Bike General Service',
    subtitle: 'Complete 24-point checkup, Motul engine oil change, brake pad overhaul & chain lube.',
    highlight: 'Free Pressure Foam Wash',
    price: '₹349',
    originalPrice: '₹599',
    categorySlug: 'bike-service',
    targetSlug: 'bike-doorstep-general-service',
    ctaText: 'Tune My Bike',
    image: '/banners/bike-service.jpg',
  },
  {
    id: 'banner-elec',
    badge: '⚡ CERTIFIED ELECTRICIAN',
    badgeColor: 'bg-amber-400 text-slate-950 font-black',
    title: 'Short Circuit & MCB Tripping',
    subtitle: 'Master technician dispatch for sudden power cuts, burning smell & breaker issues.',
    highlight: 'Arrival in 30–45 Mins',
    price: '₹249',
    originalPrice: '₹399',
    categorySlug: 'electrical-services',
    targetSlug: 'mcb-wiring-short-circuit-fix',
    ctaText: 'Fix Wiring Now',
    image: '/banners/electrical-service.jpg',
  },
  {
    id: 'banner-moving',
    badge: '📦 VERIFIED MOVERS',
    badgeColor: 'bg-[#4770DB] text-white',
    title: '1 BHK Intra-City Home Shifting',
    subtitle: 'Dedicated truck, verified packers, 3-layer bubble wrapping & zero damage transit.',
    highlight: 'Toll & Fuel Included',
    price: '₹3,499',
    originalPrice: '₹4,500',
    categorySlug: 'home-shifting',
    targetSlug: 'home-shifting-1bhk',
    ctaText: 'Schedule Move',
    image: '/banners/home-shifting.jpg',
  },
];

// Motion physics matching themallige.com Y5 configuration
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 350, damping: 32 },
      opacity: { duration: 0.3 },
    },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: 'spring' as const, stiffness: 350, damping: 32 },
      opacity: { duration: 0.25 },
    },
  }),
};

export const BannerCarousel: React.FC = () => {
  const [[slideIndex, direction], setPage] = useState<[number, number]>([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  const [slides, setSlides] = useState<BannerSlide[]>(() => {
    try {
      const saved = localStorage.getItem('reparzo_hero_slides');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.title && parsed[0].title.trim() !== '') {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_BANNER_SLIDES;
  });

  const navigate = useNavigate();
  const { setActiveCategorySlug, user } = useAppStore();
  const isAdmin = user?.role === 'admin';

  const totalSlides = slides.length > 0 ? slides.length : DEFAULT_BANNER_SLIDES.length;
  const currentIndex = ((slideIndex % totalSlides) + totalSlides) % totalSlides;
  const activeSlide = slides[currentIndex] || DEFAULT_BANNER_SLIDES[0];

  const paginate = (newDirection: number) => {
    setPage(([curr]) => [curr + newDirection, newDirection]);
  };

  const jumpToSlide = (targetIndex: number) => {
    setPage([targetIndex, targetIndex > currentIndex ? 1 : -1]);
  };

  // Smooth auto-scroll with pause on hover/touch
  useEffect(() => {
    if (isPaused || isEditorOpen) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, isEditorOpen, slideIndex]);

  const handleSlideClick = (slide: BannerSlide) => {
    if (slide.categorySlug) {
      setActiveCategorySlug(slide.categorySlug);
    }
    navigate(`/services?item=${slide.targetSlug || ''}`);
  };

  const saveSlides = (newSlides: BannerSlide[]) => {
    setSlides(newSlides);
    try {
      localStorage.setItem('reparzo_hero_slides', JSON.stringify(newSlides));
      toast.success('Hero carousel slides saved & published!');
    } catch {
      // ignore
    }
    setIsEditorOpen(false);
  };

  const resetSlides = () => {
    setSlides(DEFAULT_BANNER_SLIDES);
    try {
      localStorage.removeItem('reparzo_hero_slides');
      toast.info('Hero carousel reset to curated defaults');
    } catch {
      // ignore
    }
    setIsEditorOpen(false);
  };

  return (
    <section 
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* ── Carousel Outer Container with Themallige Aspect Ratio ── */}
      <div className="relative w-full h-[210px] xs:h-[240px] sm:h-[300px] md:h-[360px] lg:h-[400px] overflow-hidden select-none touch-pan-y rounded-2xl sm:rounded-3xl shadow-md border border-slate-200/80 bg-slate-950">
        
        {/* Admin Quick Editor Trigger */}
        {isAdmin && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsEditorOpen(true);
            }}
            aria-label="Edit Carousel Slides"
            className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-amber-300 text-[11px] font-bold border border-amber-400/40 shadow-lg transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Edit Slides</span>
          </button>
        )}

        {/* ── Framer Motion Slide Stage ── */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={slideIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.35}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -100 || offset.x < -60) {
                paginate(1);
              } else if (swipe > 100 || offset.x > 60) {
                paginate(-1);
              }
            }}
            onClick={() => handleSlideClick(activeSlide)}
            className="absolute inset-0 cursor-pointer group"
          >
            {/* Full-Bleed Background Image (No card-inside-a-card) */}
            <img
              src={activeSlide.image}
              alt={activeSlide.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="eager"
              draggable={false}
            />

            {/* Cinematic Gradient Scrim: Deep navy at base & left, clear at top/right */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080D1A] via-[#080D1A]/65 to-transparent/10 sm:bg-gradient-to-r sm:from-[#080D1A]/95 sm:via-[#080D1A]/65 sm:to-transparent" />

            {/* Subtle glow orb */}
            <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-[#4770DB]/20 rounded-full blur-[80px] pointer-events-none" />

            {/* ── Slide Typography & Call To Action (Bottom-aligned, High Contrast) ── */}
            <div className="absolute bottom-5 sm:bottom-7 left-3.5 sm:left-8 right-3.5 sm:max-w-xl text-white z-10 pointer-events-none">
              
              {/* Badge Pill Row */}
              <div className="flex items-center gap-2 mb-1.5 xs:mb-2 pointer-events-auto">
                {activeSlide.badge && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider ${activeSlide.badgeColor} shadow-md`}>
                    <Flame className="w-3 h-3" />
                    {activeSlide.badge}
                  </span>
                )}
                {activeSlide.highlight && (
                  <span className="hidden xs:inline-flex items-center gap-1 text-[10px] sm:text-xs text-cyan-300 font-bold bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {activeSlide.highlight}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-base xs:text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-1 line-clamp-1 drop-shadow-md group-hover:text-cyan-200 transition-colors">
                {activeSlide.title}
              </h2>

              {/* Subtitle */}
              <p className="text-[11px] xs:text-xs sm:text-sm text-slate-200 font-normal mb-2 xs:mb-3 line-clamp-1 sm:line-clamp-2 max-w-lg drop-shadow">
                {activeSlide.subtitle}
              </p>

              {/* Price & CTA Action */}
              <div className="flex items-center gap-2.5 pointer-events-auto">
                <div className="flex items-baseline gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                  <span className="text-sm xs:text-base sm:text-xl font-black font-mono text-white">
                    {activeSlide.price}
                  </span>
                  {activeSlide.originalPrice && (
                    <span className="text-[10px] xs:text-xs sm:text-sm font-mono text-slate-400 line-through">
                      {activeSlide.originalPrice}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlideClick(activeSlide);
                  }}
                  className="px-3.5 xs:px-4 sm:px-6 py-1.5 xs:py-2 sm:py-2.5 rounded-full bg-[#4770DB] hover:bg-[#385cc4] text-white text-[11px] xs:text-xs sm:text-sm font-bold shadow-xl shadow-[#4770DB]/35 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <span>{activeSlide.ctaText || 'Book Now'}</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Subtle Right-side Trust Badge (Desktop Only) */}
            <div className="absolute top-4 right-4 hidden md:flex items-center gap-1.5 text-xs font-semibold text-white/90 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Reparzo Assured • 30-Day Guarantee</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Left / Right Chevron Controls (Visible on Tablet/Desktop, swipe on mobile) ── */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            paginate(-1);
          }}
          aria-label="Previous Slide"
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md z-20 cursor-pointer transition-all border border-white/10 hover:scale-110 active:scale-90"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            paginate(1);
          }}
          aria-label="Next Slide"
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md z-20 cursor-pointer transition-all border border-white/10 hover:scale-110 active:scale-90"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* ── Pill Indicator Dots (Themallige Style) ── */}
        <div className="absolute bottom-2 xs:bottom-2.5 left-0 right-0 flex justify-center items-center gap-1.5 z-20 pointer-events-auto">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                jumpToSlide(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx 
                  ? 'w-6 bg-[#4770DB] shadow-md shadow-blue-500/50' 
                  : 'w-1.5 bg-white/40 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Admin Carousel Editor Modal ── */}
      {isEditorOpen && (
        <BannerEditorModal
          slides={slides}
          onSave={saveSlides}
          onReset={resetSlides}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </section>
  );
};

// ── Admin Banner Editor Component ──
interface BannerEditorModalProps {
  slides: BannerSlide[];
  onSave: (slides: BannerSlide[]) => void;
  onReset: () => void;
  onClose: () => void;
}

const BannerEditorModal: React.FC<BannerEditorModalProps> = ({
  slides: initialSlides,
  onSave,
  onReset,
  onClose,
}) => {
  const [draftSlides, setDraftSlides] = useState<BannerSlide[]>(() => {
    if (initialSlides && initialSlides.length > 0 && initialSlides[0]?.title) {
      return initialSlides;
    }
    return DEFAULT_BANNER_SLIDES;
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentSlide = draftSlides[selectedIndex] || draftSlides[0] || DEFAULT_BANNER_SLIDES[0];

  const updateCurrentSlide = (field: keyof BannerSlide, value: string) => {
    setDraftSlides((prev) =>
      prev.map((s, idx) => (idx === selectedIndex ? { ...s, [field]: value } : s))
    );
  };

  const handleAddNewSlide = () => {
    const newSlide: BannerSlide = {
      id: `banner-${Date.now()}`,
      badge: '⚡ NEW OFFER',
      badgeColor: 'bg-emerald-500 text-white',
      title: 'New Service Campaign',
      subtitle: 'Fast and reliable doorstep repair with certified technicians.',
      highlight: '60 Min Arrival',
      price: '₹299',
      originalPrice: '₹499',
      categorySlug: 'ac-services',
      targetSlug: 'ac-foam-jet-service',
      ctaText: 'Book Service',
      image: '/banners/ac-service.jpg',
    };
    setDraftSlides([...draftSlides, newSlide]);
    setSelectedIndex(draftSlides.length);
  };

  const handleDeleteSlide = (idx: number) => {
    if (draftSlides.length <= 1) {
      toast.error('At least one slide is required.');
      return;
    }
    const updated = draftSlides.filter((_, i) => i !== idx);
    setDraftSlides(updated);
    if (selectedIndex >= updated.length) {
      setSelectedIndex(updated.length - 1);
    }
  };

  const handleResetToCurated = () => {
    setDraftSlides(DEFAULT_BANNER_SLIDES);
    setSelectedIndex(0);
    onReset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Manage Hero Carousel Slides</h3>
              <p className="text-[11px] text-slate-500">Edit banners, text, prices, or upload custom imagery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-100/70 border-b border-slate-200 overflow-x-auto no-scrollbar">
          {draftSlides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setSelectedIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                selectedIndex === idx
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200/60'
              }`}
            >
              <span>Slide {idx + 1}</span>
              {draftSlides.length > 1 && (
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSlide(idx);
                  }}
                  className="p-0.5 hover:text-red-300 ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </span>
              )}
            </button>
          ))}
          <button
            onClick={handleAddNewSlide}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 border border-emerald-200 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slide</span>
          </button>
        </div>

        {/* Slide Edit Form */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Live Mini Preview Box */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Live Slide Preview</span>
            </label>
            <div className="relative w-full h-32 sm:h-36 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-md flex flex-col justify-end p-3.5 sm:p-4">
              <img
                src={currentSlide.image || '/banners/ac-service.jpg'}
                alt="Slide Preview"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/banners/ac-service.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
              
              <div className="relative z-10 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E32402] text-white">
                    {currentSlide.badge || '⚡ OFFER'}
                  </span>
                  {currentSlide.highlight && (
                    <span className="text-[10px] text-cyan-300 font-bold bg-white/10 px-2 py-0.5 rounded-full">
                      {currentSlide.highlight}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-black text-white line-clamp-1">
                  {currentSlide.title || 'Service Title'}
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-1">
                  {currentSlide.subtitle || 'Doorstep service with verified technicians.'}
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="font-black text-sm text-white font-mono">{currentSlide.price || '₹499'}</span>
                  {currentSlide.originalPrice && (
                    <span className="text-xs text-slate-400 line-through font-mono">{currentSlide.originalPrice}</span>
                  )}
                  <span className="ml-auto bg-[#2563EB] text-white px-3 py-1 rounded-full text-[10px] font-bold">
                    {currentSlide.ctaText || 'Book Now'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Integrated Image Uploader & Preset Gallery */}
          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
            <ImageUploader
              value={currentSlide.image}
              onChange={(url) => updateCurrentSlide('image', url)}
              label="Hero Banner Image (Upload or Pick from Library)"
            />
          </div>

          {/* Title & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Badge Text</label>
              <input
                type="text"
                value={currentSlide.badge || ''}
                onChange={(e) => updateCurrentSlide('badge', e.target.value)}
                placeholder="⚡ FLASH SALE • 50% OFF"
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Highlight Note</label>
              <input
                type="text"
                value={currentSlide.highlight || ''}
                onChange={(e) => updateCurrentSlide('highlight', e.target.value)}
                placeholder="60 Min Doorstep Arrival"
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Headline Title</label>
            <input
              type="text"
              value={currentSlide.title || ''}
              onChange={(e) => updateCurrentSlide('title', e.target.value)}
              placeholder="e.g. AC Foam Jet Deep Service"
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Subtitle / Details</label>
            <textarea
              rows={2}
              value={currentSlide.subtitle || ''}
              onChange={(e) => updateCurrentSlide('subtitle', e.target.value)}
              placeholder="High pressure 2X deeper coil wash & gas check..."
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
            />
          </div>

          {/* Pricing & CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Discount Price</label>
              <input
                type="text"
                value={currentSlide.price || ''}
                onChange={(e) => updateCurrentSlide('price', e.target.value)}
                placeholder="₹499"
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Original Price</label>
              <input
                type="text"
                value={currentSlide.originalPrice || ''}
                onChange={(e) => updateCurrentSlide('originalPrice', e.target.value)}
                placeholder="₹899"
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Button CTA Text</label>
              <input
                type="text"
                value={currentSlide.ctaText || ''}
                onChange={(e) => updateCurrentSlide('ctaText', e.target.value)}
                placeholder="Book AC Service"
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetToCurated}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Curated</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(draftSlides)}
              className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/25 cursor-pointer active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Save & Publish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
