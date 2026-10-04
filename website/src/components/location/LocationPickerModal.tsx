import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  X, 
  Check, 
  Search, 
  Home, 
  Briefcase, 
  Plus, 
  Star, 
  ShieldCheck, 
  AlertTriangle,
  Radio
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { toast } from 'sonner';

export const LocationPickerModal: React.FC = () => {
  const { 
    isLocationModalOpen, 
    setLocationModalOpen, 
    location, 
    setLocation,
    savedAddresses,
    selectSavedAddress,
    setDefaultAddress,
    setAddressModalOpen,
    serviceHubs,
    detectCurrentGpsLocation
  } = useAppStore();

  const [searchLocation, setSearchLocation] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  if (!isLocationModalOpen) return null;

  // Real Service Hubs from store / backend
  const filteredHubs = serviceHubs.filter((hub) =>
    hub.name.toLowerCase().includes(searchLocation.toLowerCase()) ||
    hub.area.toLowerCase().includes(searchLocation.toLowerCase()) ||
    hub.pincode.includes(searchLocation)
  );

  // Filtered Saved Addresses
  const filteredAddresses = savedAddresses.filter((addr) =>
    addr.fullAddress.toLowerCase().includes(searchLocation.toLowerCase()) ||
    addr.label.toLowerCase().includes(searchLocation.toLowerCase()) ||
    addr.pincode.includes(searchLocation)
  );

  const handleUseCurrentLocation = async () => {
    setIsDetecting(true);
    const res = await detectCurrentGpsLocation();
    setIsDetecting(false);

    if (res.success) {
      toast.success('Current GPS location detected & matched to nearest hub!');
      setLocationModalOpen(false);
    } else {
      toast.error(res.error || 'Failed to detect GPS location. Please allow browser location access.');
    }
  };

  const handleSelectHub = (hub: typeof serviceHubs[0]) => {
    setLocation({
      area: hub.area,
      city: hub.city,
      pincode: hub.pincode,
      fullAddress: hub.fullAddress,
      etaMinutes: hub.baseEtaMinutes,
      latitude: hub.latitude,
      longitude: hub.longitude,
      isServiceable: true,
      hubId: hub.id,
      hubName: hub.name,
      distanceKm: 0.8,
      isDefaultAddress: false,
      addressLabel: 'Hub',
    });
    setLocationModalOpen(false);
    toast.success(`Service location set to ${hub.name}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Select Service Location
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time dispatch from our nearest verified service hubs
                </p>
              </div>
            </div>
            <button
              onClick={() => setLocationModalOpen(false)}
              className="p-2 rounded-xl hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-white">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Search area, landmark or pincode..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* GPS Auto-detect Button */}
          <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/40 space-y-2.5">
            <button
              onClick={handleUseCurrentLocation}
              disabled={isDetecting}
              className="w-full p-3.5 rounded-2xl bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-[#2563EB]/50 flex items-center justify-between group active:scale-[0.99] transition-all shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
                  <Navigation className={`w-5 h-5 ${isDetecting ? 'animate-spin' : ''}`} />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-slate-900 block group-hover:text-[#2563EB] transition-colors">
                    {isDetecting ? 'Detecting GPS position...' : 'Use Current Location'}
                  </span>
                  <span className="text-xs text-slate-500">Using high-precision device GPS</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#2563EB] px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 flex items-center gap-1">
                ⚡ Fastest ETA
              </span>
            </button>

            {/* Free Map View Button */}
            <button
              onClick={() => {
                setLocationModalOpen(false);
                setAddressModalOpen(true);
              }}
              className="w-full py-2.5 px-3.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-[#2563EB] border border-blue-200/80 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              Add New Address on Free Map View
            </button>
          </div>

          {/* Scrollable Content (Saved Addresses + Real Hubs) */}
          <div className="p-3.5 sm:p-4 overflow-y-auto space-y-4 flex-1 bg-[#F8FAFC]">
            {/* 1. Saved Addresses Section */}
            {savedAddresses.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Saved Doorstep Addresses ({savedAddresses.length})
                  </span>
                </div>

                <div className="space-y-2">
                  {filteredAddresses.map((addr) => {
                    const isCurrent = location.fullAddress === addr.fullAddress;
                    return (
                      <div
                        key={addr.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between shadow-xs ${
                          isCurrent
                            ? 'bg-blue-50/80 border-[#2563EB]'
                            : 'bg-white border-slate-200/90 hover:border-slate-300'
                        }`}
                      >
                        <div
                          onClick={() => selectSavedAddress(addr.id)}
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                              isCurrent ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {addr.label === 'Home' ? (
                              <Home className="w-4 h-4" />
                            ) : addr.label === 'Work' ? (
                              <Briefcase className="w-4 h-4" />
                            ) : (
                              <MapPin className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4
                                className={`text-sm font-bold ${
                                  isCurrent ? 'text-[#2563EB]' : 'text-slate-900'
                                }`}
                              >
                                {addr.label}
                              </h4>
                              {addr.isDefault && (
                                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1">{addr.fullAddress}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          {!addr.isDefault && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDefaultAddress(addr.id);
                                toast.success(`"${addr.label}" set as default address`);
                              }}
                              title="Set as Default"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isCurrent && (
                            <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Real Service Hubs Section */}
            <div>
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Service Hubs ({filteredHubs.length})
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Coverage
                </span>
              </div>

              <div className="space-y-2">
                {filteredHubs.map((hub) => {
                  const isSelected = location.hubId === hub.id || location.area === hub.area;
                  return (
                    <div
                      key={hub.id}
                      onClick={() => handleSelectHub(hub)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between shadow-xs ${
                        isSelected
                          ? 'bg-blue-50/80 border-[#2563EB]'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Radio className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-sm font-bold ${
                                isSelected ? 'text-[#2563EB]' : 'text-slate-900'
                              }`}
                            >
                              {hub.name}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({hub.radiusKm} km radius)
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1">{hub.fullAddress}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                            isSelected
                              ? 'text-[#2563EB] bg-white border-blue-200'
                              : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          }`}
                        >
                          ~{hub.baseEtaMinutes} mins
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
