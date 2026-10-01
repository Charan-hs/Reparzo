import React, { useState } from 'react';
import { Search, ArrowRight, Star, Shield, Clock } from 'lucide-react';
import type { ServiceItem } from '../lib/api';

interface ServicesPageProps {
  services: ServiceItem[];
  loading: boolean;
  onSelectService: (service: ServiceItem) => void;
  onOpenBooking: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  services,
  loading,
  onSelectService,
  onOpenBooking,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Appliances', 'Home Care', 'Electrical'];

  const filtered = services.filter((s) => {
    const matchesCategory =
      selectedCategory === 'All' || s.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">All Repair Solutions</span>
        <h1 className="text-4xl font-extrabold text-white mt-1">Complete Service Catalog</h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Fixed upfront diagnostic charges, OEM spare replacement warranties, and background-verified technicians.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search appliance, e.g. AC, RO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-60 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl glass-panel border border-slate-800">
          <p className="text-slate-300 font-medium">No matching repair services found.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
            }}
            className="mt-3 text-xs text-cyan-400 font-semibold hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((service) => (
            <div
              key={service.id}
              className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between border border-slate-800 group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                    {service.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>~{service.durationMinutes} mins</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Estimate from</span>
                  <span className="text-xl font-extrabold text-cyan-400 font-mono">
                    ₹{service.priceEstimated}
                  </span>
                </div>

                <button
                  onClick={() => {
                    onSelectService(service);
                    onOpenBooking();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
