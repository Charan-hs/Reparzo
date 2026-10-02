import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit2, Trash2, Check, Sparkles, Layers, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../../store/useAppStore';
import type { Category } from '../../types';

export const CategoryManagerModal: React.FC = () => {
  const { 
    isCategoryManagerOpen, 
    setCategoryManagerOpen, 
    categories, 
    updateCategory, 
    addCategory, 
    deleteCategory 
  } = useAppStore();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBadge, setNewBadge] = useState('');

  if (!isCategoryManagerOpen) return null;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    updateCategory(editingCategory.id, editingCategory);
    toast.success(`Category "${editingCategory.title}" updated successfully!`);
    setEditingCategory(null);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter a category title');
      return;
    }

    addCategory({
      title: newTitle.trim(),
      slug: newTitle.toLowerCase().replace(/\s+/g, '-'),
      iconName: 'Wrench',
      description: newDesc.trim() || 'Professional repair and maintenance service.',
      badge: newBadge.trim() || 'New',
      bgGradient: 'from-blue-600 to-indigo-600',
      isActive: true,
      order: categories.length + 1,
    });

    toast.success(`New category "${newTitle}" created!`);
    setNewTitle('');
    setNewDesc('');
    setNewBadge('');
    setIsAddingNew(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (categories.length <= 1) {
      toast.error('You must keep at least one category.');
      return;
    }
    deleteCategory(id);
    toast.info(`Category "${title}" removed.`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88dvh] text-slate-900"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E32402] text-white flex items-center justify-center shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Admin Category CMS</h3>
                <p className="text-xs text-slate-500">
                  Manage categories shown on Home & Services Catalog in real-time
                </p>
              </div>
            </div>
            <button
              onClick={() => setCategoryManagerOpen(false)}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Categories ({categories.length})
            </span>
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-[#F8FAFC]">
            {/* Form to Add New */}
            {isAddingNew && (
              <form onSubmit={handleCreateNew} className="p-4 rounded-2xl bg-white border border-[#2563EB] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#2563EB] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Add New Service Category
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Category Title (e.g. Solar Panel Care)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-[#2563EB]"
                  />
                  <input
                    type="text"
                    placeholder="Badge Text (e.g. Starts ₹499)"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-[#2563EB]"
                  />
                </div>
                <textarea
                  placeholder="Short Description of services provided under this category..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-[#2563EB]"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  Save & Publish Category
                </button>
              </form>
            )}

            {/* List of Existing Categories */}
            {categories.map((cat) => {
              const isEditingThis = editingCategory?.id === cat.id;

              return (
                <div
                  key={cat.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isEditingThis
                      ? 'bg-white border-[#2563EB] shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  {isEditingThis ? (
                    <form onSubmit={handleSaveEdit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editingCategory.title}
                          onChange={(e) =>
                            setEditingCategory({ ...editingCategory, title: e.target.value })
                          }
                          className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm"
                        />
                        <input
                          type="text"
                          value={editingCategory.badge || ''}
                          onChange={(e) =>
                            setEditingCategory({ ...editingCategory, badge: e.target.value })
                          }
                          placeholder="Badge text"
                          className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm"
                        />
                      </div>
                      <input
                        type="text"
                        value={editingCategory.description}
                        onChange={(e) =>
                          setEditingCategory({ ...editingCategory, description: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingCategory(null)}
                          className="px-3 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{cat.title}</h4>
                          {cat.badge && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200">
                              {cat.badge}
                            </span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${cat.isActive ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'}`}>
                            {cat.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{cat.description}</p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => setEditingCategory({ ...cat })}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.title)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-amber-600 font-medium">
              <ShieldAlert className="w-4 h-4 text-amber-500" /> Live changes reflect immediately on website.
            </span>
            <button
              onClick={() => setCategoryManagerOpen(false)}
              className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold cursor-pointer"
            >
              Close CMS
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
