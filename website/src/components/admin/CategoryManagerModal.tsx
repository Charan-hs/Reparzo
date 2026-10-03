import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  Sparkles, 
  Layers, 
  ShieldAlert, 
  Clock, 
  ShieldCheck, 
  IndianRupee, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Wrench, 
  Wind, 
  Bike, 
  Truck, 
  Zap, 
  Droplet, 
  Shirt, 
  Waves,
  Eye,
  EyeOff,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../../store/useAppStore';
import type { Category, SubCategory } from '../../types';

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

const AVAILABLE_ICONS = ['Wind', 'Bike', 'Truck', 'Zap', 'Droplet', 'Sparkles', 'Shirt', 'Waves', 'Wrench'];

export const CategoryManagerModal: React.FC = () => {
  const { 
    isCategoryManagerOpen, 
    setCategoryManagerOpen, 
    categories, 
    updateCategory, 
    addCategory, 
    deleteCategory,
    subCategories,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory
  } = useAppStore();

  // Active selected category for 2-step hierarchy
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || 'cat-ac');
  const [catSearch, setCatSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');
  // Mobile tab state: 'categories' (Step 1) | 'subcategories' (Step 2)
  const [mobileTab, setMobileTab] = useState<'categories' | 'subcategories'>('categories');

  // Modals & form states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatTitle, setNewCatTitle] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatBadge, setNewCatBadge] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Wrench');

  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);

  // SubCategory Form State
  const [subTitle, setSubTitle] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [subBadge, setSubBadge] = useState('');
  const [subStartingPrice, setSubStartingPrice] = useState<number>(499);
  const [subOriginalPrice, setSubOriginalPrice] = useState<number>(799);
  const [subDuration, setSubDuration] = useState<number>(45);
  const [subWarranty, setSubWarranty] = useState<number>(30);
  const [subFeatures, setSubFeatures] = useState('');

  if (!isCategoryManagerOpen) return null;

  const currentCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

  // Filtered categories for left rail
  const filteredCategories = categories.filter((c) => 
    c.title.toLowerCase().includes(catSearch.toLowerCase()) ||
    c.slug.toLowerCase().includes(catSearch.toLowerCase())
  );

  // Filtered subcategories for current active category
  const currentSubCategories = (subCategories || []).filter((s) => {
    const matchesCategory = s.categoryId === currentCategory?.id || s.categorySlug === currentCategory?.slug;
    const matchesSearch = subSearch.trim() === '' || 
      s.title.toLowerCase().includes(subSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(subSearch.toLowerCase()) ||
      (s.badge && s.badge.toLowerCase().includes(subSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // ── Category Handlers ──
  const handleSaveCategoryEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    updateCategory(editingCategory.id, editingCategory);
    toast.success(`Category "${editingCategory.title}" updated!`);
    setEditingCategory(null);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatTitle.trim()) {
      toast.error('Category title is required');
      return;
    }

    const slug = newCatTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    addCategory({
      title: newCatTitle.trim(),
      slug,
      iconName: newCatIcon,
      description: newCatDesc.trim() || 'Verified doorstep repair & care service.',
      badge: newCatBadge.trim() || 'New',
      bgGradient: 'from-blue-600 to-indigo-600',
      isActive: true,
      order: categories.length + 1,
    });

    toast.success(`Category "${newCatTitle}" created!`);
    setNewCatTitle('');
    setNewCatDesc('');
    setNewCatBadge('');
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = (id: string, title: string) => {
    if (categories.length <= 1) {
      toast.error('At least one category is required.');
      return;
    }
    deleteCategory(id);
    if (selectedCatId === id) {
      const fallback = categories.find((c) => c.id !== id);
      if (fallback) setSelectedCatId(fallback.id);
    }
    toast.info(`Category "${title}" removed.`);
  };

  // ── SubCategory Handlers ──
  const openAddSubModal = () => {
    setSubTitle('');
    setSubDesc('');
    setSubBadge('Instant Arrival');
    setSubStartingPrice(399);
    setSubOriginalPrice(699);
    setSubDuration(45);
    setSubWarranty(30);
    setSubFeatures('Verified Technician, Genuine Spares, 30-Day Guarantee');
    setIsAddingSubCategory(true);
  };

  const handleCreateSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTitle.trim() || !currentCategory) {
      toast.error('Subcategory title is required');
      return;
    }

    const slug = subTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const featuresList = subFeatures.split(',').map((f) => f.trim()).filter(Boolean);

    addSubCategory({
      categoryId: currentCategory.id,
      categorySlug: currentCategory.slug,
      title: subTitle.trim(),
      slug,
      iconName: currentCategory.iconName,
      description: subDesc.trim() || `Professional ${subTitle} by verified technicians with standard rate cards.`,
      badge: subBadge.trim() || 'Starts ₹' + subStartingPrice,
      startingPrice: Number(subStartingPrice) || 299,
      originalPrice: Number(subOriginalPrice) || 499,
      durationMinutes: Number(subDuration) || 45,
      warrantyDays: Number(subWarranty) || 30,
      isActive: true,
      order: currentSubCategories.length + 1,
      features: featuresList,
    });

    toast.success(`Subcategory "${subTitle}" added to ${currentCategory.title}!`);
    setIsAddingSubCategory(false);
  };

  const openEditSubModal = (sub: SubCategory) => {
    setEditingSubCategory({ ...sub });
  };

  const handleSaveSubCategoryEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubCategory) return;
    updateSubCategory(editingSubCategory.id, editingSubCategory);
    toast.success(`Subcategory "${editingSubCategory.title}" updated!`);
    setEditingSubCategory(null);
  };

  const handleDeleteSubCategory = (id: string, title: string) => {
    deleteSubCategory(id);
    toast.info(`Subcategory "${title}" deleted.`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 lg:p-6 bg-black/60 md:backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full md:h-[92vh] md:max-h-[860px] md:max-w-6xl bg-white rounded-none md:rounded-3xl border-0 md:border border-slate-200 shadow-2xl overflow-hidden flex flex-col text-slate-900"
        >
          {/* ── Top Master Header ─────────────────────────── */}
          <header className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#2563EB] to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                    Admin Category & Subcategory CMS
                  </h3>
                  <span className="hidden sm:inline-flex text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 uppercase tracking-wider">
                    2-Step Hierarchy
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">
                  Blinkit-style dual-rail catalog management: Click any category to inspect, reorder, and configure its subcategories in real-time.
                </p>
              </div>
            </div>

            <button
              onClick={() => setCategoryManagerOpen(false)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer flex-shrink-0 ml-2"
              aria-label="Close CMS"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* ── Mobile Dual-Rail Tab Switcher (Visible only on < md screens) ── */}
          <div className="flex md:hidden items-center border-b border-slate-200 bg-slate-100/90 p-2 gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setMobileTab('categories')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileTab === 'categories'
                  ? 'bg-white text-[#2563EB] shadow-xs border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Categories ({categories.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('subcategories')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileTab === 'subcategories'
                  ? 'bg-white text-[#2563EB] shadow-xs border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="truncate">{currentCategory?.title || 'Subcategories'} ({currentSubCategories.length})</span>
            </button>
          </div>

          {/* ── Main Dual-Rail Split Workspace ────────────── */}
          <div className="flex flex-1 overflow-hidden">
            {/* ── LEFT STATIC RAIL: Categories List ───────── */}
            <aside className={`w-full md:w-72 lg:w-80 flex-shrink-0 bg-slate-50/90 border-r border-slate-200/80 flex-col h-full overflow-hidden ${mobileTab === 'categories' ? 'flex' : 'hidden md:flex'}`}>

              {/* Left Rail Header & Search */}
              <div className="p-3.5 border-b border-slate-200/80 space-y-2 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Step 1: Categories ({categories.length})
                  </span>
                  <button
                    onClick={() => setIsAddingCategory(true)}
                    className="px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Category</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>

              {/* Scrollable Categories Rail */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {filteredCategories.map((cat) => {
                  const isSelected = cat.id === currentCategory?.id;
                  const Icon = ICON_MAP[cat.iconName] || Wrench;
                  const subCount = (subCategories || []).filter(
                    (s) => s.categoryId === cat.id || s.categorySlug === cat.slug
                  ).length;

                  return (
                    <motion.div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCatId(cat.id);
                        setMobileTab('subcategories');
                      }}
                      className={`group relative p-3 rounded-2xl cursor-pointer transition-all duration-200 select-none ${
                        isSelected
                          ? 'bg-white shadow-md shadow-blue-500/10 border border-[#2563EB]/40'
                          : 'hover:bg-slate-200/60 border border-transparent'
                      }`}
                    >
                      {/* Active Left Indicator Bar */}
                      {isSelected && (
                        <motion.div
                          layoutId="activeCategoryRailPill"
                          className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full bg-[#2563EB]"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}

                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${
                              isSelected
                                ? 'bg-gradient-to-br from-[#2563EB] to-indigo-600 text-white shadow-xs scale-105'
                                : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="min-w-0">
                            <h4
                              className={`text-xs font-bold truncate ${
                                isSelected ? 'text-slate-900 font-extrabold' : 'text-slate-700'
                              }`}
                            >
                              {cat.title}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  cat.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                              />
                              <span className="text-[10px] text-slate-400 font-medium">
                                {subCount} {subCount === 1 ? 'subcategory' : 'subcategories'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {cat.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200/70 truncate max-w-[70px]">
                              {cat.badge}
                            </span>
                          )}
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              isSelected ? 'text-[#2563EB] translate-x-0.5' : 'text-slate-300'
                            }`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Left Rail Footer Stats */}
              <div className="p-3 border-t border-slate-200/80 bg-white text-[11px] text-slate-500 flex items-center justify-between">
                <span>Total: {categories.length} Categories</span>
                <span className="font-bold text-[#2563EB]">{(subCategories || []).length} Subcategories</span>
              </div>
            </aside>

            {/* ── RIGHT DYNAMIC WORKSPACE: Subcategories & Variables ───────── */}
            <main className={`flex-1 flex-col h-full bg-[#F8FAFC] overflow-hidden ${mobileTab === 'subcategories' ? 'flex' : 'hidden md:flex'}`}>

              {currentCategory ? (
                <>
                  {/* Category Banner Bar */}
                  <div className="p-4 sm:p-5 border-b border-slate-200/90 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div>
                      {/* Mobile Back Button to Categories */}
                      <button
                        type="button"
                        onClick={() => setMobileTab('categories')}
                        className="md:hidden inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-[#1d4ed8] mb-2 self-start py-1 px-2.5 rounded-lg bg-blue-50 border border-blue-100 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>All Categories</span>
                      </button>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 tracking-wider">
                          Parent Category
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-400 font-mono">slug: /{currentCategory.slug}</span>
                        {currentCategory.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200">
                            {currentCategory.badge}
                          </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${currentCategory.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {currentCategory.isActive ? 'Active on Storefront' : 'Hidden'}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <span>{currentCategory.title}</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5 max-w-xl">{currentCategory.description}</p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                      <button
                        onClick={() => setEditingCategory({ ...currentCategory })}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Category</span>
                      </button>
                      <button
                        onClick={openAddSubModal}
                        className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Subcategory</span>
                      </button>
                    </div>
                  </div>

                  {/* Subcategories Filter & Sub-header */}
                  <div className="px-6 py-3 border-b border-slate-200/80 bg-white/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        Step 2: Subcategories ({currentSubCategories.length})
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                        Shown in Blinkit-style left selector for customer
                      </span>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={subSearch}
                        onChange={(e) => setSubSearch(e.target.value)}
                        placeholder="Search subcategories..."
                        className="w-full pl-8 pr-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#2563EB]"
                      />
                    </div>
                  </div>

                  {/* Subcategories List Area with Smooth Motion */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                    {currentSubCategories.length === 0 ? (
                      <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-slate-300 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
                          <Layers className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">No subcategories created yet</h4>
                          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            Every Blinkit-style category has dedicated subcategories for specific problems and services.
                          </p>
                        </div>
                        <button
                          onClick={openAddSubModal}
                          className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add First Subcategory</span>
                        </button>
                      </div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                          {currentSubCategories.map((sub, idx) => (
                            <motion.div
                              key={sub.id}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.2, delay: idx * 0.03 }}
                              className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                            >
                              {/* Sub Header & Badges */}
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h4 className="text-sm font-extrabold text-slate-900">{sub.title}</h4>
                                      {sub.badge && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                          {sub.badge}
                                        </span>
                                      )}
                                      <span
                                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                          sub.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'
                                        }`}
                                      >
                                        {sub.isActive ? 'Active' : 'Disabled'}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                                      slug: /{sub.slug}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                      onClick={() => openEditSubModal(sub)}
                                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                      title="Edit All Variables"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSubCategory(sub.id, sub.title)}
                                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                                      title="Delete Subcategory"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                                  {sub.description}
                                </p>
                              </div>

                              {/* Key Variables Pill Bar */}
                              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                                <div className="flex items-center gap-1 font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                                  <span>Starts ₹{sub.startingPrice}</span>
                                  {sub.originalPrice && sub.originalPrice > sub.startingPrice && (
                                    <span className="text-slate-400 line-through text-[10px]">
                                      ₹{sub.originalPrice}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-[11px]">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{sub.durationMinutes} Mins</span>
                                </div>

                                <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 text-[11px] font-semibold">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>{sub.warrantyDays}d Warranty</span>
                                </div>
                              </div>

                              {/* Features / Inclusion Chips */}
                              {sub.features && sub.features.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {sub.features.map((feat, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                                    >
                                      ✓ {feat}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </AnimatePresence>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
                  Select a category from the left rail to view subcategories.
                </div>
              )}
            </main>
          </div>

          {/* ── Footer ────────────────────────────────────── */}
          <footer className="px-4 sm:px-6 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex items-center justify-between flex-shrink-0 gap-2">
            <span className="flex items-center gap-1.5 text-amber-600 font-semibold text-[11px] sm:text-xs truncate">
              <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="truncate">Live changes reflect immediately on website catalog.</span>
            </span>
            <button
              onClick={() => setCategoryManagerOpen(false)}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer text-xs flex-shrink-0"
            >
              Close CMS
            </button>
          </footer>
        </motion.div>

        {/* ── Modal: Add SubCategory Form ────────────────── */}
        {isAddingSubCategory && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                    +
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Add Subcategory to {currentCategory?.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">Configure all rate card variables</p>
                  </div>
                </div>
                <button onClick={() => setIsAddingSubCategory(false)} className="text-slate-400 hover:text-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubCategory} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Subcategory Title *</label>
                  <input
                    type="text"
                    required
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    placeholder="e.g. Copper Brazing & Leak Seal"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:bg-white focus:border-[#2563EB]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={subBadge}
                      onChange={(e) => setSubBadge(e.target.value)}
                      placeholder="e.g. 50% OFF Rush"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Duration (Mins)</label>
                    <input
                      type="number"
                      value={subDuration}
                      onChange={(e) => setSubDuration(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Starting Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={subStartingPrice}
                      onChange={(e) => setSubStartingPrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Warranty Days</label>
                    <input
                      type="number"
                      value={subWarranty}
                      onChange={(e) => setSubWarranty(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={subDesc}
                    onChange={(e) => setSubDesc(e.target.value)}
                    placeholder="Short summary of work done under this subcategory..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Features / Inclusions (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={subFeatures}
                    onChange={(e) => setSubFeatures(e.target.value)}
                    placeholder="e.g. Foam spray, Gas level check, 30d warranty"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white focus:border-[#2563EB]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingSubCategory(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold shadow-sm"
                  >
                    Publish Subcategory
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ── Modal: Edit SubCategory Form ───────────────── */}
        {editingSubCategory && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900">
                  Edit Subcategory Variables ({editingSubCategory.title})
                </h4>
                <button onClick={() => setEditingSubCategory(null)} className="text-slate-400 hover:text-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSubCategoryEdit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editingSubCategory.title}
                    onChange={(e) => setEditingSubCategory({ ...editingSubCategory, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:bg-white focus:border-[#2563EB]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Badge</label>
                    <input
                      type="text"
                      value={editingSubCategory.badge || ''}
                      onChange={(e) => setEditingSubCategory({ ...editingSubCategory, badge: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Starting Price (₹)</label>
                    <input
                      type="number"
                      value={editingSubCategory.startingPrice}
                      onChange={(e) => setEditingSubCategory({ ...editingSubCategory, startingPrice: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={editingSubCategory.durationMinutes}
                      onChange={(e) => setEditingSubCategory({ ...editingSubCategory, durationMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Warranty (Days)</label>
                    <input
                      type="number"
                      value={editingSubCategory.warrantyDays}
                      onChange={(e) => setEditingSubCategory({ ...editingSubCategory, warrantyDays: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingSubCategory.description}
                    onChange={(e) => setEditingSubCategory({ ...editingSubCategory, description: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">Active Visibility on Storefront</span>
                  <input
                    type="checkbox"
                    checked={editingSubCategory.isActive}
                    onChange={(e) => setEditingSubCategory({ ...editingSubCategory, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[#2563EB] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingSubCategory(null)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ── Modal: Add Category Form ───────────────────── */}
        {isAddingCategory && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900">Create New Parent Category</h4>
                <button onClick={() => setIsAddingCategory(false)} className="text-slate-400 hover:text-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Category Title *</label>
                  <input
                    type="text"
                    required
                    value={newCatTitle}
                    onChange={(e) => setNewCatTitle(e.target.value)}
                    placeholder="e.g. Chimney & Kitchen Hood"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:bg-white focus:border-[#2563EB]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Badge</label>
                    <input
                      type="text"
                      value={newCatBadge}
                      onChange={(e) => setNewCatBadge(e.target.value)}
                      placeholder="e.g. New Launch"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Icon</label>
                    <select
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      {AVAILABLE_ICONS.map((icon) => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Short description of this category..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold shadow-sm"
                  >
                    Create Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ── Modal: Edit Category Form ──────────────────── */}
        {editingCategory && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900">Edit Parent Category</h4>
                <button onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCategoryEdit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.title}
                    onChange={(e) => setEditingCategory({ ...editingCategory, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Badge</label>
                    <input
                      type="text"
                      value={editingCategory.badge || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, badge: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Icon</label>
                    <select
                      value={editingCategory.iconName}
                      onChange={(e) => setEditingCategory({ ...editingCategory, iconName: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      {AVAILABLE_ICONS.map((icon) => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingCategory.description}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">Active Visibility</span>
                  <input
                    type="checkbox"
                    checked={editingCategory.isActive}
                    onChange={(e) => setEditingCategory({ ...editingCategory, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[#2563EB] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteCategory(editingCategory.id, editingCategory.title);
                      setEditingCategory(null);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold"
                  >
                    Delete Category
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
