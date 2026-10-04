import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin, Wrench, User, FileText, Lock, HelpCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const Footer: React.FC = () => {
  const { setAuthModalOpen } = useAppStore();

  return (
    <footer className="border-t border-slate-200 bg-white pt-12 pb-24 sm:pb-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand & Contact Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="inline-block">
              <img
                src="/logo.png"
                alt="Reparzo"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Reparzo connects customers with local service professionals and businesses for rapid doorstep appliance and vehicle repairs with upfront transparent rates.
            </p>
            
            <div className="pt-2 space-y-2 text-xs">
              <a 
                href="mailto:Contact@reparzo.com"
                className="flex items-center gap-2 text-slate-600 hover:text-[#2563EB] transition-colors group"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span className="font-semibold group-hover:underline">Contact@reparzo.com</span>
              </a>
              <a 
                href="tel:+916362000263"
                className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors group"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="font-mono font-bold group-hover:underline">+91 6362000263</span>
              </a>
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>Davangere, Karnataka, India</span>
              </div>
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

          {/* User Portals & Legal Navigation */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Portals & Legal
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
                <Link to="/terms" className="hover:text-[#2563EB] transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#2563EB] transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-600" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#2563EB] transition-colors flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600" /> Contact & Help Desk
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
                <span>100% Genuine Spare Parts</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Every replacement component is OEM certified with transparent pricing and direct doorstep digital billing.
              </p>
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              Operating hub: <strong className="text-slate-700">Davangere, Karnataka</strong> • On-demand service network across Karnataka.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Reparzo. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link to="/terms" className="hover:text-[#2563EB] transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-[#2563EB] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-[#2563EB] transition-colors">Contact Support</Link>
            <span>•</span>
            <span className="text-slate-400">Davangere, Karnataka, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
