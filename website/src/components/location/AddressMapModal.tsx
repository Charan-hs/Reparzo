import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Navigation, 
  Search, 
  Home, 
  Briefcase, 
  Check, 
  AlertTriangle, 
  ShieldCheck,
  Loader2,
  Building
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../../store/useAppStore';
import { reverseGeocode, searchPlaces, checkServiceability, PlaceSearchResult } from '../../lib/geo';
import { toast } from 'sonner';

export const AddressMapModal: React.FC = () => {
  const { 
    isAddressModalOpen, 
    setAddressModalOpen, 
    addAddress, 
    serviceHubs,
    savedAddresses,
    addressModalInitialCoords 
  } = useAppStore();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);

  // Default coordinate (HSR Layout Central)
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: addressModalInitialCoords?.lat || 12.9116,
    lng: addressModalInitialCoords?.lng || 77.6389,
  });

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);

  // Address Form State
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [flatNumber, setFlatNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560102');
  const [fullAddress, setFullAddress] = useState('');
  const [isDefault, setIsDefault] = useState(savedAddresses.length === 0);

  // Dynamic Serviceability state
  const serviceCheck = checkServiceability(coords.lat, coords.lng, serviceHubs);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isAddressModalOpen || !mapContainerRef.current) return;

    const initialLat = coords.lat;
    const initialLng = coords.lng;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom Reparzo Animated Pin Icon
    const customIcon = L.divIcon({
      className: 'custom-leaflet-pin',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 38px; height: 38px; background: rgba(37, 99, 235, 0.25); border-radius: 50%; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 34px; height: 34px; background: #2563EB; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 14px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const marker = L.marker([initialLat, initialLng], {
      icon: customIcon,
      draggable: true,
    }).addTo(map);

    markerRef.current = marker;
    mapInstanceRef.current = map;

    // Draw Hub Coverage Radius Circles
    const circlesLayer = L.layerGroup().addTo(map);
    circlesLayerRef.current = circlesLayer;

    serviceHubs.forEach((hub) => {
      if (hub.isActive) {
        L.circle([hub.latitude, hub.longitude], {
          radius: hub.radiusKm * 1000,
          color: '#2563EB',
          weight: 1.5,
          opacity: 0.6,
          fillColor: '#3B82F6',
          fillOpacity: 0.08,
        })
          .bindPopup(`<b>${hub.name}</b><br/>Service Radius: ${hub.radiusKm} km<br/>Doorstep Service Hub`)
          .addTo(circlesLayer);
      }
    });

    // Handle Marker Drag
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setCoords({ lat: pos.lat, lng: pos.lng });
      triggerReverseGeocode(pos.lat, pos.lng);
    });

    // Handle Map Click to Reposition Marker
    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      triggerReverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    // Initial reverse geocode
    triggerReverseGeocode(initialLat, initialLng);

    // Invalidate map size after animation
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(resizeTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isAddressModalOpen, serviceHubs]);

  // Reverse geocode handler with debouncing
  const triggerReverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const result = await reverseGeocode(lat, lng);
      setArea(result.area);
      setCity(result.city);
      setPincode(result.pincode);
      setFullAddress(result.fullAddress);
    } catch {
      // ignore
    } finally {
      setIsGeocoding(false);
    }
  };

  // Fly to location
  const flyToLocation = (lat: number, lng: number) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
      markerRef.current.setLatLng([lat, lng]);
      setCoords({ lat, lng });
      triggerReverseGeocode(lat, lng);
    }
  };

  // Current GPS button on Map
  const handleLocateMe = () => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        flyToLocation(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setIsGeocoding(false);
        toast.error(`Unable to retrieve GPS: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Place search debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResultsDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchPlaces(searchQuery);
      setSearchResults(results);
      setShowResultsDropdown(results.length > 0);
      setIsSearching(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (res: PlaceSearchResult) => {
    setShowResultsDropdown(false);
    setSearchQuery('');
    flyToLocation(res.latitude, res.longitude);
  };

  // Save Address Submission
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!flatNumber.trim()) {
      toast.error('Please enter House / Flat / Door Number');
      return;
    }

    if (!area.trim()) {
      toast.error('Please specify an Area or Landmark');
      return;
    }

    const composedAddress = `${flatNumber.trim()}${landmark.trim() ? `, Near ${landmark.trim()}` : ''}, ${area}, ${city} - ${pincode}`;

    const newAddress = addAddress({
      label,
      flatNumber: flatNumber.trim(),
      landmark: landmark.trim(),
      area,
      city,
      pincode,
      fullAddress: composedAddress,
      latitude: coords.lat,
      longitude: coords.lng,
      isDefault,
    });

    toast.success(`Address saved as "${label}"!${newAddress.isDefault ? ' (Default doorstep)' : ''}`);
    setAddressModalOpen(false);
  };

  if (!isAddressModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92dvh] h-[92dvh] md:h-[620px]"
        >
          {/* Left Column: Interactive Map View */}
          <div className="relative w-full md:w-7/12 h-64 md:h-full bg-slate-100 flex flex-col">
            {/* Top Search Overlay */}
            <div className="absolute top-3.5 left-3.5 right-3.5 z-[1000]">
              <div className="relative">
                <div className="flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 px-3.5 py-2.5">
                  <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search locality, apartment or landmark..."
                    className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
                  />
                  {isSearching && <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin ml-2" />}
                  {searchQuery && !isSearching && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {showResultsDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {searchResults.map((item) => (
                      <button
                        key={item.placeId}
                        type="button"
                        onClick={() => handleSelectSearchResult(item)}
                        className="w-full text-left p-3 hover:bg-blue-50/60 transition-colors flex items-start gap-2.5 cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{item.displayName}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Leaflet Map Container */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* GPS My Location Button */}
            <button
              onClick={handleLocateMe}
              type="button"
              className="absolute bottom-4 left-4 z-[1000] p-3 rounded-2xl bg-white shadow-xl border border-slate-200 text-slate-700 hover:text-[#2563EB] hover:bg-blue-50/60 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer active:scale-95"
            >
              <Navigation className={`w-4 h-4 ${isGeocoding ? 'animate-spin text-[#2563EB]' : 'text-[#2563EB]'}`} />
              <span className="hidden sm:inline">Use My GPS Location</span>
            </button>

            {/* Instruction tooltip badge */}
            <div className="absolute bottom-4 right-14 z-[1000] pointer-events-none hidden sm:block">
              <span className="bg-slate-900/85 backdrop-blur-sm text-white text-[11px] px-3 py-1.5 rounded-full font-medium shadow-md">
                📍 Drag pin or tap map to adjust doorstep
              </span>
            </div>
          </div>

          {/* Right Column: Address Form Details */}
          <div className="w-full md:w-5/12 flex flex-col bg-white overflow-y-auto p-5 sm:p-6 justify-between flex-1">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Add Doorstep Address</h3>
                    <p className="text-[11px] text-slate-500">Map selection with instant pin accuracy</p>
                  </div>
                </div>
                <button
                  onClick={() => setAddressModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Serviceability Banner */}
              <div className={`p-3 rounded-2xl mb-4 border flex items-start gap-2.5 ${
                serviceCheck.isServiceable
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}>
                {serviceCheck.isServiceable ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  {serviceCheck.isServiceable ? (
                    <div>
                      <span className="font-bold block text-emerald-800">
                        ⚡ Serviceable Hub: {serviceCheck.nearestHub?.name}
                      </span>
                      <span className="text-emerald-700 text-[11px]">
                        Doorstep service active ({serviceCheck.distanceKm} km from hub)
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold block text-amber-800">
                        Outside Current Service Area
                      </span>
                      <span className="text-amber-700 text-[11px]">
                        Nearest hub is {serviceCheck.distanceKm} km away. We are rapidly expanding!
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Form */}
              <form id="address-form" onSubmit={handleSave} className="space-y-3.5">
                {/* Tag Selection */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Save Address As
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Home', icon: Home, label: 'Home' },
                      { id: 'Work', icon: Briefcase, label: 'Work' },
                      { id: 'Other', icon: MapPin, label: 'Other' },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = label === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setLabel(item.id as any)}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 border-[#2563EB] text-[#2563EB]'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Flat / House # */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    House / Flat / Door Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={flatNumber}
                    onChange={(e) => setFlatNumber(e.target.value)}
                    placeholder="e.g. Flat 402, Prestige Palms"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-[#2563EB] outline-none"
                  />
                </div>

                {/* Street / Landmark */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Landmark / Nearby Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Opposite BDA Complex / Next to Apollo"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-[#2563EB] outline-none"
                  />
                </div>

                {/* Detected Area & Pincode (Auto-filled from map) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Area / Locality
                    </label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="Locality"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-[#2563EB] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="560XXX"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-[#2563EB] outline-none"
                    />
                  </div>
                </div>

                {/* Default Address Checkbox */}
                <div className="pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="w-4 h-4 rounded text-[#2563EB] focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      Set as Default Doorstep Address
                    </span>
                  </label>
                  <p className="text-[10px] text-slate-400 pl-6.5 mt-0.5">
                    When set as default, Reparzo uses this location on launch without requesting device GPS.
                  </p>
                </div>
              </form>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-4 border-t border-slate-100 mt-4">
              <button
                type="submit"
                form="address-form"
                className="w-full py-3 px-4 rounded-2xl bg-[#2563EB] hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Save Address & Select
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
