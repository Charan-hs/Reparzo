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
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Building
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const LocationPickerModal: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isLocationModalOpen, 
    setLocationModalOpen, 
    location, 
    savedAddresses,
    selectSavedAddress,
    setDefaultAddress,
    setAddressModalOpen,
    detectCurrentGpsLocation
  } = useAppStore();

  const [searchLocation, setSearchLocation] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  if (!isLocationModalOpen) return null;

  // Filtered Saved Addresses
  const filteredAddresses = savedAddresses.filter((addr) =>
    addr.fullAddress.toLowerCase().includes(searchLocation.toLowerCase()) ||
    addr.label.toLowerCase().includes(searchLocation.toLowerCase()) ||
    addr.area.toLowerCase().includes(searchLocation.toLowerCase()) ||
    addr.pincode.includes(searchLocation)
  );

  const handleUseCurrentLocation = async () => {
    setIsDetecting(true);
    const res = await detectCurrentGpsLocation();
    setIsDetecting(false);

    if (res.success) {
      toast.success('Current GPS location detected!');
      setLocationModalOpen(false);
    } else {
      toast.error(res.error || 'Failed to detect GPS location. Please allow browser location access.');
    }
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
                  Choose your doorstep address for doorstep service
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
                placeholder="Search your saved addresses..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* GPS Auto-detect & Add Address Buttons */}
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

            {/* Map View Button */}
            <button
              onClick={() => {
                setLocationModalOpen(false);
                setAddressModalOpen(true);
              }}
              className="w-full py-2.5 px-3.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-[#2563EB] border border-blue-200/80 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              Add New Address to Map
            </button>
          </div>

          {/* Scrollable Content: Notice + Added Addresses */}
          <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3.5 flex-1 bg-[#F8FAFC]">
            
            {/* ── Non-Serviceable Notice Banner (Sleek & Minimized) ─────────────────── */}
            {location.isServiceable === false ? (
              <div className="px-3.5 py-2.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-950 flex items-center justify-between gap-2.5 text-xs shadow-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-900 leading-snug">
                    Service unavailable in <strong>{location.area}</strong>
                  </p>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 flex-shrink-0 whitespace-nowrap">
                  Coming Soon 🚀
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">
                    Current Location: <strong>{location.area}</strong> (Service Active)
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 flex-shrink-0">
                  ~{location.etaMinutes} mins
                </span>
              </div>
            )}

            {/* ── Saved Addresses Added by User ─────────────────── */}
            <div>
              <div className="flex items-center justify-between px-1 mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Your Added Addresses ({savedAddresses.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLocationModalOpen(false);
                    navigate('/profile?tab=addresses');
                  }}
                  className="text-[11px] font-bold text-[#2563EB] hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Manage in Profile ➔
                </button>
              </div>

              {savedAddresses.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 text-center space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
                    <Building className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No Saved Addresses Added Yet</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Save your Home, Work, or other doorstep addresses using our interactive map for seamless 1-click booking.
                  </p>
                  <button
                    onClick={() => {
                      setLocationModalOpen(false);
                      setAddressModalOpen(true);
                    }}
                    className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Address to Map
                  </button>
                </div>
              ) : (
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
                          className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
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
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4
                                className={`text-sm font-bold truncate ${
                                  isCurrent ? 'text-[#2563EB]' : 'text-slate-900'
                                }`}
                              >
                                {addr.label}
                              </h4>
                              {addr.isDefault && (
                                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate">{addr.fullAddress}</p>
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
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
