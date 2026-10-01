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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-[#0E1B4D] rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[88dvh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#152355] to-[#0E1B4D]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E32402] text-white flex items-center justify-center shadow-md">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Admin Category CMS</h3>
                <p className="text-xs text-slate-300">
                  Manage categories shown on Home & Services Catalog in real-time
                </p>
              </div>
            </div>
            <button
              onClick={() => setCategoryManagerOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Categories ({categories.length})
            </span>
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#4770DB] hover:bg-[#3b5fc4] text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4 overflow-y-auto space-y-3 flex-1">
            {/* Form to Add New */}
            {isAddingNew && (
              <form onSubmit={handleCreateNew} className="p-4 rounded-2xl bg-slate-900 border border-[#4770DB] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Add New Service Category
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="text-xs text-slate-400 hover:text-white"
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
                    className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-none focus:border-[#4770DB]"
                  />
                  <input
                    type="text"
                    placeholder="Badge Text (e.g. Starts ₹499)"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-none focus:border-[#4770DB]"
                  />
                </div>
                <textarea
                  placeholder="Short Description of services provided under this category..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-none focus:border-[#4770DB]"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
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
                      ? 'bg-slate-900 border-[#4770DB]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
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
                          className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm"
                        />
                        <input
                          type="text"
                          value={editingCategory.badge || ''}
                          onChange={(e) =>
                            setEditingCategory({ ...editingCategory, badge: e.target.value })
                          }
                          placeholder="Badge text"
                          className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm"
                        />
                      </div>
                      <input
                        type="text"
                        value={editingCategory.description}
                        onChange={(e) =>
                          setEditingCategory({ ...editingCategory, description: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingCategory(null)}
                          className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-[#4770DB] text-white text-xs font-bold shadow-md"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{cat.title}</h4>
                          {cat.badge && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#4770DB]/20 text-[#4770DB] border border-[#4770DB]/30">
                              {cat.badge}
                            </span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.2 rounded ${cat.isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-800'}`}>
                            {cat.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{cat.description}</p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => setEditingCategory({ ...cat })}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.title)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
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
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-amber-400">
              <ShieldAlert className="w-4 h-4" /> Live changes reflect immediately on website.
            </span>
            <button
              onClick={() => setCategoryManagerOpen(false)}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
            >
              Close CMS
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
