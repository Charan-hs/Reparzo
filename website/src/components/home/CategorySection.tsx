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
  CheckCircle2,
  ShieldCheck
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
};

export const CategorySection: React.FC = () => {
  const { categories, setActiveCategorySlug, user, setCategoryManagerOpen } = useAppStore();
  const navigate = useNavigate();

  const handleCategoryClick = (category: Category) => {
    setActiveCategorySlug(category.slug);
    navigate(`/services?category=${category.slug}`);
  };

  const activeCategories = categories.filter((c) => c.isActive);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* ── Section Header ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#4770DB] animate-ping" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4770DB]">
              On-Demand Categories
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            What needs repair today?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Select a category to view upfront prices and book doorstep technicians in 60-90 minutes.
          </p>
        </div>

        {/* Admin CMS Trigger (if logged in as admin) */}
        {user?.role === 'admin' ? (
          <button
            onClick={() => setCategoryManagerOpen(true)}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#E32402] hover:bg-[#c91f00] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#E32402]/30 active:scale-95 transition-all cursor-pointer"
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
            className="self-start sm:self-auto text-xs sm:text-sm font-bold text-[#4770DB] hover:text-white flex items-center gap-1.5 transition-colors group cursor-pointer"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* ── Category Grid (Double-Bezel Cards) ────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
        {activeCategories.map((cat) => {
          const Icon = ICON_MAP[cat.iconName] || Wrench;

          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className="group p-1 rounded-3xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-[#4770DB]/50 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl hover:shadow-[#4770DB]/10"
            >
              <div className="p-4 sm:p-5 rounded-[calc(1.5rem-4px)] bg-[#0E1B4D]/70 group-hover:bg-[#12215c] transition-colors flex flex-col justify-between h-full min-h-[140px] sm:min-h-[160px] relative overflow-hidden">
                
                {/* Ambient glow in background on hover */}
                <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-[#4770DB]/15 blur-2xl group-hover:bg-[#4770DB]/30 transition-all pointer-events-none" />

                {/* Top Row: Icon & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-[#4770DB] to-blue-700 text-white flex items-center justify-center shadow-lg shadow-[#4770DB]/30 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  {cat.badge && (
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase px-2 sm:px-2.5 py-0.5 rounded-full bg-white/10 text-cyan-300 border border-white/10 tracking-wider">
                      {cat.badge}
                    </span>
                  )}
                </div>

                {/* Bottom Row: Title & Subtitle */}
                <div className="mt-4">
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-200 transition-colors flex items-center justify-between">
                    <span>{cat.title}</span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#4770DB] group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-1">
                    {cat.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
