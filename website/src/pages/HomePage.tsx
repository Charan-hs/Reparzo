import React, { useState } from 'react';
import { 
  Wrench, 
  ShieldCheck, 
  Zap, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  Cpu, 
  Sparkles,
  Server,
  Layers
} from 'lucide-react';
import type { ServiceItem } from '../lib/api';

interface HomePageProps {
  services: ServiceItem[];
  loading: boolean;
  onSelectService: (service: ServiceItem) => void;
  onOpenBooking: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  services,
  loading,
  onSelectService,
  onOpenBooking,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Appliances', 'Home Care', 'Electrical'];

  const filteredServices =
    selectedCategory === 'All'
      ? services
      : services.filter((s) => s.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-20 pb-16">
      {/* ── 1. Hero Section ───────────────────────────── */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Ambient edge glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-blue-600/20 to-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 shadow-inner mb-6">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span className="text-xs font-semibold text-slate-300">
            Next-Gen Edge Appliance Repair • Bangalore
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Precision Repairs.{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
            Delivered in 90 Minutes.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Book verified technicians for ACs, washing machines, refrigerators, and electronics. 
          Powered by Cloudflare Workers and low-latency D1 SQLite distributed architecture.
        </p>

        {/* Hero CTA & Quick Search */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenBooking}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-cyan-500/25 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Book a Repair Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <a
            href="/services"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-base transition-colors"
          >
            Browse All Services
          </a>
        </div>

        {/* Live Metrics Row */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl glass-panel text-center">
            <div className="text-2xl sm:text-3xl font-bold text-cyan-400 font-mono">90 min</div>
            <div className="text-xs text-slate-400 mt-1">Average Doorstep Arrival</div>
          </div>
          <div className="p-4 rounded-2xl glass-panel text-center">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">30 Days</div>
            <div className="text-xs text-slate-400 mt-1">Post-Repair Warranty</div>
          </div>
          <div className="p-4 rounded-2xl glass-panel text-center">
            <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono">4.9 ★</div>
            <div className="text-xs text-slate-400 mt-1">12,400+ Happy Customers</div>
          </div>
          <div className="p-4 rounded-2xl glass-panel text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-400 font-mono">&lt; 35ms</div>
            <div className="text-xs text-slate-400 mt-1">Cloudflare D1 Query Time</div>
          </div>
        </div>
      </section>

      {/* ── 2. Category Filters & Services Catalog ───── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Catalog</span>
            <h2 className="text-3xl font-bold text-white mt-1">Popular Appliance Services</h2>
            <p className="text-sm text-slate-400 mt-1">Upfront pricing, zero hidden charges, and transparent quotes.</p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between group border border-slate-800"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                      {service.category}
                    </span>
                    {service.isPopular && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-cyan-400 text-cyan-400" />
                        Most Requested
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-2.5 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Inspection Starts at</span>
                    <span className="text-xl font-extrabold text-cyan-400 font-mono">
                      ₹{service.priceEstimated}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectService(service);
                      onOpenBooking();
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Book Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 3. Edge Architecture Guarantee ────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Edge Infrastructure
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
                Engineered for Reliability & Zero-Downtime
              </h2>
              <p className="text-slate-300 mt-4 leading-relaxed">
                Reparzo executes customer bookings on Cloudflare edge workers with ACID transactional guarantees provided by Cloudflare D1. Every request is isolated, protected against surges, and verified with end-to-end telemetry.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-200">
                    <strong>Distributed SQLite Primary</strong>: Instant reads with sub-second replication.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-200">
                    <strong>Direct Service Bindings</strong>: Internal zero-egress routing between website worker and backend worker.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-200">
                    <strong>Custom AppError Protection</strong>: Differentiates operational client faults from systemic crashes.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs text-slate-300 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                <span className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span>Cloudflare Worker Topology</span>
                </span>
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  OPERATIONAL
                </span>
              </div>
              <p className="text-slate-400"># Reparzo Edge Stack Status</p>
              <p><span className="text-cyan-400">RUNTIME:</span> Cloudflare Workers (V8 Isolates)</p>
              <p><span className="text-cyan-400">API_FRAMEWORK:</span> Hono Edge v4.13.5</p>
              <p><span className="text-cyan-400">PRIMARY_DB:</span> Cloudflare D1 (SQLite distributed)</p>
              <p><span className="text-cyan-400">ORM_LAYER:</span> Drizzle ORM v0.45.2 (Type-Safe)</p>
              <p><span className="text-cyan-400">CACHE_BINDING:</span> Cloudflare KV Namespace</p>
              <p><span className="text-cyan-400">STORAGE:</span> Cloudflare R2 Media Bucket</p>
              <p className="pt-2 text-slate-500">// Response time: ~18ms across 300+ edge locations</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
