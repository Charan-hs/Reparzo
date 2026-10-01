import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Server, Phone, Mail, MapPin, Layers, Wrench, User } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const Footer: React.FC = () => {
  const { setAuthModalOpen, setCategoryManagerOpen } = useAppStore();

  return (
    <footer className="border-t border-slate-800/80 bg-[#080D1A] pt-12 pb-20 sm:pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="inline-block">
              <img
                src="/logo.png"
                alt="Reparzo"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Bengaluru's premier on-demand home & vehicle repair platform. Verified technicians at your doorstep in 60-90 minutes with upfront transparent rates.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Server className="w-3.5 h-3.5 text-[#4770DB]" />
              <span>Edge-native architecture via Cloudflare Workers & D1</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Doorstep Services
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li><Link to="/services?category=ac-services" className="hover:text-white transition-colors">AC Foam Jet & Gas Refill</Link></li>
              <li><Link to="/services?category=bike-service" className="hover:text-white transition-colors">Doorstep Bike Servicing</Link></li>
              <li><Link to="/services?category=home-shifting" className="hover:text-white transition-colors">Packers & Home Shifting</Link></li>
              <li><Link to="/services?category=electrical-services" className="hover:text-white transition-colors">Short Circuit & MCB Fix</Link></li>
              <li><Link to="/services?category=plumbing-services" className="hover:text-white transition-colors">Tap & Concealed Pipe Leaks</Link></li>
            </ul>
          </div>

          {/* User Portals & Access */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Portals & Roles
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <button
                  onClick={() => setAuthModalOpen(true, 'user')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-[#4770DB]" /> Customer Sign In
                </button>
              </li>
              <li>
                <button
                  onClick={() => setAuthModalOpen(true, 'partner')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-400" /> Technician / Partner Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCategoryManagerOpen(true)}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5 text-[#E32402]" /> Admin Category CMS
                </button>
              </li>
              <li>
                <Link to="/health" className="hover:text-white transition-colors">
                  System Health & Metrics
                </Link>
              </li>
            </ul>
          </div>

          {/* Guarantees */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Reparzo Guarantee
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>30-Day Service Warranty</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                If the repaired issue reoccurs within 30 days, we dispatch a senior supervisor to resolve it for free.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Reparzo.com. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Powered by Cloudflare D1 Serverless Edge
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
