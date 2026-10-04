import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wind, 
  Bike, 
  Truck, 
  Zap, 
  Droplet, 
  Sparkles, 
  Shirt, 
  Waves, 
  Wrench, 
  ArrowRight, 
  Edit3,
  Beef,
  Package,
  Send,
  HelpCircle,
  PlusCircle,
  FileQuestion,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { Category } from '../../types';

// Map icon names to Lucide icon components
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
  Beef,
  Package,
  Send,
  HelpCircle,
  PlusCircle,
  FileQuestion,
  Layers,
  ShoppingBag,
};

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  'ac-services': '/banners/ac-service.jpg',
  'bike-service': '/banners/bike-service.jpg',
  'home-shifting': '/banners/home-shifting.jpg',
  'electrical-services': '/banners/electrical-service.jpg',
  'plumbing-services': '/banners/plumbing-service.jpg',
  'refrigerator-services': '/banners/refrigerator-service.jpg',
  'washing-machine-services': '/banners/washing-machine-service.jpg',
  'water-tank-services': '/banners/water-tank-service.jpg',
  'meat-delivery': '/banners/meat-delivery.jpg',
  'parcel-services': '/banners/parcel-delivery.jpg',
  'courier-services': '/banners/courier-service.jpg',
  'custom-requests': '/banners/custom-request.jpg',
};

export const CategorySection: React.FC = () => {
  const { 
    categories, 
    setActiveCategorySlug, 
    setActiveSubCategorySlug, 
    user, 
    setCategoryManagerOpen,
    setCustomRequestModalOpen 
  } = useAppStore();
  const navigate = useNavigate();

  const handleCategoryClick = (category: Category) => {
    if (category.slug === 'custom-requests') {
      setCustomRequestModalOpen(true, 'other');
      return;
    }
    setActiveCategorySlug(category.slug);
    setActiveSubCategorySlug('all');
    navigate(`/services?category=${category.slug}`);
  };

  const activeCategories = categories.filter((c) => c.isActive);


  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* ── Section Header ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              On-Demand Categories
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            What needs repair today?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Select a category to view upfront prices and book doorstep technicians in 60-90 minutes.
          </p>
        </div>

        {/* Admin CMS Trigger (if logged in as admin) */}
        {user?.role === 'admin' ? (
          <button
            onClick={() => setCategoryManagerOpen(true)}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#E32402] hover:bg-[#c91f00] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#E32402]/20 active:scale-95 transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Categories (Admin)</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setActiveCategorySlug('all');
              navigate('/services');
            }}
            className="self-start sm:self-auto text-xs sm:text-sm font-bold text-[#2563EB] hover:text-[#1d4ed8] flex items-center gap-1.5 transition-colors group cursor-pointer"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* ── Category Grid (Urban Company Style Cards with Photo Banners) ────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-5">
        {activeCategories.map((cat) => {
          const Icon = ICON_MAP[cat.iconName] || Wrench;
          const imageSrc = cat.image || DEFAULT_CATEGORY_IMAGES[cat.slug] || '/banners/ac-service.jpg';

          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className="group rounded-2xl sm:rounded-3xl bg-white hover:bg-slate-50/50 border border-slate-200/90 hover:border-[#2563EB]/40 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-2xs hover:shadow-xl hover:shadow-blue-500/10 flex flex-col overflow-hidden"
            >
              {/* Top Banner Photo */}
              <div className="relative w-full h-32 sm:h-40 overflow-hidden bg-slate-100">
                <img
                  src={imageSrc}
                  alt={cat.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/banners/ac-service.jpg';
                  }}
                />

                {/* Subtle gradient scrim at bottom of image for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-70 group-hover:opacity-45 transition-opacity" />

                {/* Category Icon Glass Badge (Top Left) */}
                <div className="absolute top-2.5 left-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/90 backdrop-blur-md text-[#2563EB] flex items-center justify-center shadow-xs border border-white/60 group-hover:scale-110 transition-transform">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>

                {/* Promo Badge (Top Right) */}
                {cat.badge && (
                  <span className="absolute top-2.5 right-2.5 text-[9px] sm:text-[10px] font-black uppercase px-2 sm:px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-slate-800 border border-white/80 shadow-xs tracking-wider">
                    {cat.badge}
                  </span>
                )}
              </div>

              {/* Bottom Info Section */}
              <div className="p-3.5 sm:p-4.5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-[#2563EB] transition-colors flex items-center justify-between">
                    <span>{cat.title}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Custom & Unique Request Callout Card ── */}
      <div className="mt-8 p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-lg shadow-amber-500/20 flex-shrink-0">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Specialized & Custom Requests
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">Got a unique errand or repair?</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Can't find what you need? Request directly to Reparzo Admin
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              From fresh cuts of meat at your favorite bazaar to urgent forgotten keys or custom electronic repairs — tell our operations team and we'll calculate a quote and dispatch a verified runner.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex-shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setCustomRequestModalOpen(true, 'other')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-blue-600 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Submit Custom Request ➔</span>
          </button>
        </div>
      </div>
    </section>
  );
};

