import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Server, Phone, Mail, MapPin, Layers, Wrench, User } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const Footer: React.FC = () => {
  const { setAuthModalOpen, setCategoryManagerOpen } = useAppStore();

  return (
    <footer className="border-t border-slate-200 bg-white pt-12 pb-24 sm:pb-12 text-slate-600">
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
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Bengaluru's premier on-demand home & vehicle repair platform. Verified technicians at your doorstep in 60-90 minutes with upfront transparent rates.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Server className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Edge-native architecture via Cloudflare Workers & D1</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Doorstep Services
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li><Link to="/services?category=ac-services" className="hover:text-[#2563EB] transition-colors">AC Foam Jet & Gas Refill</Link></li>
              <li><Link to="/services?category=bike-service" className="hover:text-[#2563EB] transition-colors">Doorstep Bike Servicing</Link></li>
              <li><Link to="/services?category=home-shifting" className="hover:text-[#2563EB] transition-colors">Packers & Home Shifting</Link></li>
              <li><Link to="/services?category=electrical-services" className="hover:text-[#2563EB] transition-colors">Short Circuit & MCB Fix</Link></li>
              <li><Link to="/services?category=plumbing-services" className="hover:text-[#2563EB] transition-colors">Tap & Concealed Pipe Leaks</Link></li>
            </ul>
          </div>

          {/* User Portals & Access */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Portals & Roles
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="hover:text-[#2563EB] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#2563EB]" /> Single Sign-On / Login
                </button>
              </li>
              <li>
                <Link to="/partner" className="hover:text-[#2563EB] transition-colors flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-500" /> Technician / Partner Board
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#2563EB] transition-colors flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#E32402]" /> Executive Admin Portal
                </Link>
              </li>
              <li>
                <Link to="/health" className="hover:text-[#2563EB] transition-colors">
                  System Health & Edge Telemetry
                </Link>
              </li>
            </ul>
          </div>

          {/* Guarantees */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Reparzo Guarantee
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>30-Day Service Warranty</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                If the repaired issue reoccurs within 30 days, we dispatch a senior supervisor to resolve it for free.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} Reparzo Technologies Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-600 cursor-pointer">Bengaluru, KA, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
