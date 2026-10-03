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
  Edit3
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
  const { categories, setActiveCategorySlug, setActiveSubCategorySlug, user, setCategoryManagerOpen } = useAppStore();
  const navigate = useNavigate();

  const handleCategoryClick = (category: Category) => {
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

      {/* ── Category Grid (Crisp White Light Cards) ────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
        {activeCategories.map((cat) => {
          const Icon = ICON_MAP[cat.iconName] || Wrench;

          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className="group p-4 sm:p-5 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-[#2563EB]/40 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between min-h-[145px] sm:min-h-[165px] relative overflow-hidden"
            >
              {/* Subtle top ambient glow */}
              <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-blue-100/50 blur-2xl group-hover:bg-blue-200/60 transition-all pointer-events-none" />

              {/* Top Row: Icon & Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-[#2563EB] to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {cat.badge && (
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase px-2 sm:px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 tracking-wider">
                    {cat.badge}
                  </span>
                )}
              </div>

              {/* Bottom Row: Title & Subtitle */}
              <div className="mt-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors flex items-center justify-between">
                  <span>{cat.title}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563EB] group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {cat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
