import React from 'react';
import { Wrench, Shield, Zap, Server, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white">Reparzo</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ultra-reliable appliance & electronics repair powered by Cloudflare Workers isolates and distributed SQLite.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Edge-Hosted via Cloudflare D1</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">Services</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/services" className="hover:text-cyan-400 transition-colors">AC Repair & Gas Refill</a></li>
              <li><a href="/services" className="hover:text-cyan-400 transition-colors">Refrigerator Cooling Fix</a></li>
              <li><a href="/services" className="hover:text-cyan-400 transition-colors">Washing Machine PCB</a></li>
              <li><a href="/services" className="hover:text-cyan-400 transition-colors">RO Water Purifiers</a></li>
            </ul>
          </div>

          {/* Architecture & Tech */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">Stack Architecture</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Hono on Cloudflare Workers</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Cloudflare D1 (SQLite)</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Drizzle ORM Type-Safe SQL</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> React 19 + Vite Monorepo</li>
            </ul>
          </div>

          {/* Guarantees */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">Peace of Mind</h4>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>30-Day Service Warranty</span>
              </div>
              <p className="text-[11px] text-slate-400">
                All repairs include authentic OEM spares and guaranteed workmanship.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Reparzo. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Sub-50ms Global Response Time
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
