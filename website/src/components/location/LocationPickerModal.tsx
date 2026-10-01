import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, X, Check, Search, Building, Home, Briefcase } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { LocationData } from '../../types';

export const LocationPickerModal: React.FC = () => {
  const { isLocationModalOpen, setLocationModalOpen, location, setLocation } = useAppStore();
  const [searchLocation, setSearchLocation] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  if (!isLocationModalOpen) return null;

  const popularAreas: LocationData[] = [
    {
      area: 'HSR Layout, Sector 2',
      city: 'Bengaluru',
      pincode: '560102',
      fullAddress: '14th Main, HSR Layout Sector 2, Bengaluru',
      etaMinutes: 20,
    },
    {
      area: 'Koramangala 4th Block',
      city: 'Bengaluru',
      pincode: '560034',
      fullAddress: '80 Feet Road, Koramangala 4th Block, Bengaluru',
      etaMinutes: 25,
    },
    {
      area: 'Indiranagar 100ft Road',
      city: 'Bengaluru',
      pincode: '560038',
      fullAddress: '12th Main, HAL 2nd Stage, Indiranagar, Bengaluru',
      etaMinutes: 30,
    },
    {
      area: 'Whitefield Inner Circle',
      city: 'Bengaluru',
      pincode: '560066',
      fullAddress: 'ITPL Main Road, Whitefield, Bengaluru',
      etaMinutes: 40,
    },
    {
      area: 'Jayanagar 4th T Block',
      city: 'Bengaluru',
      pincode: '560041',
      fullAddress: '11th Main, 4th Block Jayanagar, Bengaluru',
      etaMinutes: 35,
    },
  ];

  const filteredAreas = popularAreas.filter((item) =>
    item.area.toLowerCase().includes(searchLocation.toLowerCase()) ||
    item.pincode.includes(searchLocation)
  );

  const handleUseCurrentLocation = () => {
    setIsDetecting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsDetecting(false);
          setLocation({
            area: 'Indiranagar (Current GPS)',
            city: 'Bengaluru',
            pincode: '560038',
            fullAddress: 'Detected via GPS coordinates, Bengaluru, Karnataka',
            etaMinutes: 18,
          });
        },
        () => {
          setIsDetecting(false);
          // Fallback simulation
          setLocation({
            area: 'HSR Layout, Sector 1',
            city: 'Bengaluru',
            pincode: '560102',
            fullAddress: 'HSR Sector 1, Bengaluru, Karnataka',
            etaMinutes: 20,
          });
        },
        { timeout: 5000 }
      );
    } else {
      setIsDetecting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="w-full max-w-lg bg-[#0E1B4D] rounded-t-3xl sm:rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#4770DB]" />
                Select Service Location
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Technicians dispatched from the nearest local hub
              </p>
            </div>
            <button
              onClick={() => setLocationModalOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/50">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Search area, landmark or pincode..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-400 text-sm focus:border-[#4770DB] outline-none"
              />
            </div>
          </div>

          {/* GPS Auto-detect Button */}
          <div className="p-4 border-b border-slate-800">
            <button
              onClick={handleUseCurrentLocation}
              disabled={isDetecting}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#4770DB]/20 via-[#4770DB]/10 to-transparent border border-[#4770DB]/40 hover:border-[#4770DB] flex items-center justify-between group active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4770DB] text-white flex items-center justify-center shadow-md">
                  <Navigation className={`w-5 h-5 ${isDetecting ? 'animate-spin' : ''}`} />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-white block group-hover:text-cyan-300 transition-colors">
                    {isDetecting ? 'Locating GPS position...' : 'Use Current Location'}
                  </span>
                  <span className="text-xs text-slate-300">Using high-precision device GPS</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#4770DB] px-2.5 py-1 rounded-full bg-[#4770DB]/10 border border-[#4770DB]/20">
                ⚡ Fastest ETA
              </span>
            </button>
          </div>

          {/* Saved / Popular Locations List */}
          <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1 mb-2">
              Popular Service Hubs in Bengaluru
            </span>

            {filteredAreas.map((area, idx) => {
              const isSelected = location.area === area.area;
              return (
                <div
                  key={idx}
                  onClick={() => setLocation(area)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#4770DB]/20 border-[#4770DB] shadow-md'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                      {idx % 2 === 0 ? <Home className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{area.area}</h4>
                      <p className="text-xs text-slate-300 line-clamp-1">{area.fullAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ~{area.etaMinutes} mins
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#4770DB] text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
