import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Sliders, 
  Power, 
  Navigation, 
  Radio, 
  Layers, 
  Search,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Crosshair,
  Sparkles
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../../store/useAppStore';
import type { ServiceHub } from '../../types';
import { checkServiceability, reverseGeocode, searchPlaces, PlaceSearchResult } from '../../lib/geo';
import { toast } from 'sonner';

export const AdminGeoCoverageTab: React.FC = () => {
  const { 
    serviceHubs, 
    addServiceHub, 
    updateServiceHub, 
    deleteServiceHub, 
    fetchServiceHubs 
  } = useAppStore();

  // Radar Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const testMarkerRef = useRef<L.Marker | null>(null);

  // Modal Map refs
  const modalMapContainerRef = useRef<HTMLDivElement>(null);
  const modalMapRef = useRef<L.Map | null>(null);
  const modalMarkerRef = useRef<L.Marker | null>(null);
  const modalCircleRef = useRef<L.Circle | null>(null);

  // Selected Hub for editing
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Hub Form State
  const [newHubName, setNewHubName] = useState('');
  const [newHubCode, setNewHubCode] = useState('');
  const [newHubArea, setNewHubArea] = useState('');
  const [newHubCity, setNewHubCity] = useState('Bengaluru');
  const [newHubPincode, setNewHubPincode] = useState('560001');
  const [newHubLat, setNewHubLat] = useState(12.9716);
  const [newHubLng, setNewHubLng] = useState(77.5946);
  const [newHubRadius, setNewHubRadius] = useState(8.0);
  const [newHubBaseEta, setNewHubBaseEta] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Place Search State inside Modal
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showPlaceDropdown, setShowPlaceDropdown] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Sandbox Tester Coordinates
  const [testCoords, setTestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [testResult, setTestResult] = useState<ReturnType<typeof checkServiceability> | null>(null);

  // ── 1. Main Live Coverage Radar Map ──────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.95, 77.64],
        zoom: 11,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const layersGroup = L.layerGroup().addTo(map);
      layersGroupRef.current = layersGroup;

      // Click on radar map to test location or select coordinates
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setTestCoords({ lat, lng });
        const result = checkServiceability(lat, lng, serviceHubs);
        setTestResult(result);

        if (testMarkerRef.current) {
          testMarkerRef.current.setLatLng([lat, lng]);
        } else {
          const testIcon = L.divIcon({
            className: 'test-pin',
            html: `
              <div style="background:#EF4444;width:26px;height:26px;border-radius:50%;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;">
                📍
              </div>
            `,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });
          testMarkerRef.current = L.marker([lat, lng], { icon: testIcon }).addTo(map);
        }
      });

      mapRef.current = map;
    }

    // Refresh hub markers and coverage circles
    if (layersGroupRef.current) {
      layersGroupRef.current.clearLayers();

      serviceHubs.forEach((hub) => {
        // Draw Radius Coverage Circle
        const circle = L.circle([hub.latitude, hub.longitude], {
          radius: hub.radiusKm * 1000,
          color: hub.isActive ? '#2563EB' : '#94A3B8',
          weight: 2,
          opacity: 0.8,
          fillColor: hub.isActive ? '#3B82F6' : '#CBD5E1',
          fillOpacity: hub.isActive ? 0.12 : 0.05,
        });

        circle.bindTooltip(
          `<b>${hub.name}</b><br/>Radius: ${hub.radiusKm} km<br/>Status: ${hub.isActive ? 'Active' : 'Paused'}`,
          { permanent: false, direction: 'top' }
        );

        circle.addTo(layersGroupRef.current!);

        // Hub Center Marker
        const hubIcon = L.divIcon({
          className: 'hub-pin',
          html: `
            <div style="background:${hub.isActive ? '#2563EB' : '#64748B'};width:30px;height:30px;border-radius:50%;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
                <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
                <circle cx="12" cy="12" r="2"/>
                <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/>
                <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>
              </svg>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([hub.latitude, hub.longitude], { icon: hubIcon }).addTo(
          layersGroupRef.current!
        );

        marker.on('click', () => {
          setSelectedHubId(hub.id);
        });
      });
    }
  }, [serviceHubs]);

  // ── 2. Interactive Map inside "Add Serviceable Hub" Modal ─
  useEffect(() => {
    if (!isAddModalOpen || !modalMapContainerRef.current) return;

    if (modalMapRef.current) {
      modalMapRef.current.remove();
      modalMapRef.current = null;
    }

    const modalMap = L.map(modalMapContainerRef.current, {
      center: [newHubLat, newHubLng],
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(modalMap);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(modalMap);

    // Draggable Pin with animated pulse
    const pinIcon = L.divIcon({
      className: 'modal-hub-pin',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 38px; height: 38px; background: rgba(37, 99, 235, 0.35); border-radius: 50%; animation: ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 34px; height: 34px; background: #2563EB; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 14px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const marker = L.marker([newHubLat, newHubLng], {
      icon: pinIcon,
      draggable: true,
    }).addTo(modalMap);

    // Live Service Radius circle
    const circle = L.circle([newHubLat, newHubLng], {
      radius: newHubRadius * 1000,
      color: '#2563EB',
      weight: 2,
      fillColor: '#3B82F6',
      fillOpacity: 0.16,
    }).addTo(modalMap);

    modalMapRef.current = modalMap;
    modalMarkerRef.current = marker;
    modalCircleRef.current = circle;

    // Drag Marker -> Update Lat, Lng & Reverse Geocode
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      circle.setLatLng(pos);
      setNewHubLat(pos.lat);
      setNewHubLng(pos.lng);
      triggerReverseGeocodeForHub(pos.lat, pos.lng);
    });

    // Tap Map -> Move Marker & Circle
    modalMap.on('click', (e) => {
      marker.setLatLng(e.latlng);
      circle.setLatLng(e.latlng);
      setNewHubLat(e.latlng.lat);
      setNewHubLng(e.latlng.lng);
      triggerReverseGeocodeForHub(e.latlng.lat, e.latlng.lng);
    });

    // Invalidate size to avoid rendering glitches
    const timer = setTimeout(() => {
      modalMap.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (modalMapRef.current) {
        modalMapRef.current.remove();
        modalMapRef.current = null;
      }
    };
  }, [isAddModalOpen]);

  // Reverse geocode when map pin moves
  const triggerReverseGeocodeForHub = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await reverseGeocode(lat, lng);
      setNewHubArea(res.area);
      setNewHubCity(res.city);
      setNewHubPincode(res.pincode);
      if (!newHubName || newHubName.includes('Hub')) {
        setNewHubName(`${res.area || res.city} Hub`);
      }
      if (!newHubCode) {
        const prefix = (res.city || res.area || 'HUB').substring(0, 3).toUpperCase();
        setNewHubCode(`${prefix}-01`);
      }
    } catch {
      // ignore
    } finally {
      setIsGeocoding(false);
    }
  };

  // Place Search inside Modal Map
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowPlaceDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchPlaces(searchQuery);
      setSearchResults(results);
      setShowPlaceDropdown(results.length > 0);
      setIsSearching(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchedPlace = (item: PlaceSearchResult) => {
    setShowPlaceDropdown(false);
    setSearchQuery('');
    setNewHubLat(item.latitude);
    setNewHubLng(item.longitude);
    setNewHubCity(item.city || item.name);
    setNewHubArea(item.name);
    if (item.pincode) setNewHubPincode(item.pincode);
    setNewHubName(`${item.name} Hub`);
    const prefix = (item.city || item.name).substring(0, 3).toUpperCase();
    setNewHubCode(`${prefix}-01`);

    if (modalMapRef.current && modalMarkerRef.current && modalCircleRef.current) {
      modalMapRef.current.flyTo([item.latitude, item.longitude], 13, { duration: 1.2 });
      modalMarkerRef.current.setLatLng([item.latitude, item.longitude]);
      modalCircleRef.current.setLatLng([item.latitude, item.longitude]);
    }
  };

  // Live Radius update (adjusts the circle on the map in real-time)
  const handleRadiusSliderChange = (newRadius: number) => {
    setNewHubRadius(newRadius);
    if (modalCircleRef.current) {
      modalCircleRef.current.setRadius(newRadius * 1000);
    }
  };

  // Manual Lat/Lng sync to map
  const handleManualLatChange = (lat: number) => {
    setNewHubLat(lat);
    if (modalMarkerRef.current && modalCircleRef.current && modalMapRef.current) {
      modalMarkerRef.current.setLatLng([lat, newHubLng]);
      modalCircleRef.current.setLatLng([lat, newHubLng]);
      modalMapRef.current.panTo([lat, newHubLng]);
    }
  };

  const handleManualLngChange = (lng: number) => {
    setNewHubLng(lng);
    if (modalMarkerRef.current && modalCircleRef.current && modalMapRef.current) {
      modalMarkerRef.current.setLatLng([newHubLat, lng]);
      modalCircleRef.current.setLatLng([newHubLat, lng]);
      modalMapRef.current.panTo([newHubLat, lng]);
    }
  };

  // Open Add Hub modal with clicked pin from radar map
  const handleOpenAddFromPin = () => {
    if (testCoords) {
      setNewHubLat(testCoords.lat);
      setNewHubLng(testCoords.lng);
      triggerReverseGeocodeForHub(testCoords.lat, testCoords.lng);
    }
    setIsAddModalOpen(true);
  };

  // Radius adjustment for existing hub in list
  const handleUpdateRadius = async (hubId: string, newRadius: number) => {
    await updateServiceHub(hubId, { radiusKm: newRadius });
    toast.success(`Service radius updated to ${newRadius} km`);
  };

  // Toggle active/pause status
  const handleToggleStatus = async (hub: ServiceHub) => {
    const nextStatus = !hub.isActive;
    await updateServiceHub(hub.id, { isActive: nextStatus });
    toast.success(`Hub "${hub.name}" ${nextStatus ? 'Activated' : 'Paused'}`);
  };

  // Delete hub
  const handleDeleteHub = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete hub "${name}"?`)) return;
    await deleteServiceHub(id);
    if (selectedHubId === id) setSelectedHubId(null);
    toast.success(`Hub "${name}" deleted`);
  };

  // Create new hub
  const handleCreateHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHubName.trim() || !newHubCode.trim()) {
      toast.error('Please provide Hub Name and Code');
      return;
    }

    setIsSubmitting(true);
    try {
      await addServiceHub({
        name: newHubName.trim(),
        code: newHubCode.trim().toUpperCase(),
        area: newHubArea.trim() || newHubName.trim(),
        city: newHubCity.trim(),
        pincode: newHubPincode.trim(),
        fullAddress: `${newHubArea.trim() || newHubName.trim()}, ${newHubCity.trim()} - ${newHubPincode.trim()}`,
        latitude: Number(newHubLat),
        longitude: Number(newHubLng),
        radiusKm: Number(newHubRadius),
        baseEtaMinutes: Number(newHubBaseEta),
        perKmEtaMinutes: 2.0,
        isActive: true,
        order: serviceHubs.length + 1,
      });

      toast.success(`New hub "${newHubName}" created at [${newHubLat.toFixed(4)}, ${newHubLng.toFixed(4)}] with ${newHubRadius} km coverage!`);
      setIsAddModalOpen(false);
      // Reset form
      setNewHubName('');
      setNewHubCode('');
      setNewHubArea('');
    } catch {
      toast.error('Failed to create hub');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Bar with Actions ───────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-[#2563EB]" />
            Geo Coverage & Serviceable Hubs
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure delivery hubs, set real-time dispatch radius (in km), and click or search places to set coordinates automatically
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New Service Hub
          </button>
        </div>
      </div>

      {/* ── Map & Hub Manager Split View ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Coverage Map (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl flex flex-col h-[520px]">
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2563EB]" />
              <span className="text-xs font-bold text-slate-300">Live Coverage Radar</span>
            </div>
            <span className="text-[11px] text-slate-400">
              💡 Tap any location on map to test serviceability or add a hub
            </span>
          </div>

          <div ref={mapContainerRef} className="flex-1 w-full h-full z-0" />

          {/* Sandbox Test Result Strip */}
          {testResult && testCoords && (
            <div className={`p-3 border-t text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
              testResult.isServiceable
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
                : 'bg-amber-950/80 border-amber-800 text-amber-200'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                {testResult.isServiceable ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                )}
                <span className="truncate">
                  <strong>Pin [{testCoords.lat.toFixed(4)}, {testCoords.lng.toFixed(4)}]:</strong>{' '}
                  {testResult.isServiceable
                    ? `SERVICEABLE by "${testResult.nearestHub?.name}" (~${testResult.distanceKm} km, ETA ${testResult.etaMinutes}m)`
                    : `OUT OF AREA (Nearest hub is ${testResult.distanceKm} km away)`}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleOpenAddFromPin}
                  className="px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Create Hub Here
                </button>
                <button
                  onClick={() => setTestResult(null)}
                  className="text-[10px] uppercase font-bold text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Hub List & Radius Sliders (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#2563EB]" />
              Active Dispatch Hubs ({serviceHubs.length})
            </h3>
            <span className="text-[10px] text-slate-400 uppercase font-mono">Radius Tuner</span>
          </div>

          <div className="overflow-y-auto space-y-3 pr-1 flex-1">
            {serviceHubs.map((hub) => {
              const isSelected = selectedHubId === hub.id;
              return (
                <div
                  key={hub.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-blue-950/40 border-[#2563EB]'
                      : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-200">
                          {hub.code}
                        </span>
                        <h4 className="text-sm font-bold text-white">{hub.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{hub.fullAddress}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Coords: {hub.latitude.toFixed(4)}° N, {hub.longitude.toFixed(4)}° E
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleToggleStatus(hub)}
                        title={hub.isActive ? 'Pause Hub' : 'Activate Hub'}
                        className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                          hub.isActive
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteHub(hub.id, hub.name)}
                        title="Delete Hub"
                        className="p-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Radius Slider Control */}
                  <div className="mt-3 pt-2.5 border-t border-slate-750 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Serviceable Radius:</span>
                      <strong className="text-[#2563EB] font-mono text-sm font-black">
                        {hub.radiusKm} km
                      </strong>
                    </div>

                    <input
                      type="range"
                      min={2}
                      max={25}
                      step={0.5}
                      value={hub.radiusKm}
                      onChange={(e) => handleUpdateRadius(hub.id, parseFloat(e.target.value))}
                      className="w-full accent-[#2563EB] cursor-pointer"
                    />

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Min: 2 km</span>
                      <span>Base ETA: ~{hub.baseEtaMinutes} mins</span>
                      <span>Max: 25 km</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Add New Hub Modal (Interactive Map + Place Search) ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92dvh] h-[92dvh] md:h-[620px]">
            
            {/* Left: Interactive Map & Place Search Picker */}
            <div className="relative w-full md:w-7/12 h-64 md:h-full bg-slate-950 flex flex-col border-b md:border-b-0 md:border-r border-slate-800">
              
              {/* Top Search Autocomplete Overlay */}
              <div className="absolute top-3.5 left-3.5 right-3.5 z-[1000]">
                <div className="relative">
                  <div className="flex items-center bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/80 px-3.5 py-2.5">
                    <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search city, town or locality (e.g. Davangere, Mysore)..."
                      className="w-full text-xs sm:text-sm bg-transparent outline-none text-white placeholder-slate-400"
                    />
                    {isSearching && <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin ml-2 flex-shrink-0" />}
                    {searchQuery && !isSearching && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="p-1 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Search Autocomplete Dropdown */}
                  {showPlaceDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden divide-y divide-slate-800 max-h-56 overflow-y-auto">
                      {searchResults.map((item) => (
                        <button
                          key={item.placeId}
                          type="button"
                          onClick={() => handleSelectSearchedPlace(item)}
                          className="w-full text-left p-3 hover:bg-slate-800 transition-colors flex items-start gap-2.5 cursor-pointer"
                        >
                          <MapPin className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-white">{item.name}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">{item.displayName}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Leaflet Map for Pin Placement */}
              <div ref={modalMapContainerRef} className="w-full h-full z-0" />

              {/* Bottom Map Badge & Instruction */}
              <div className="absolute bottom-3 left-3.5 right-3.5 z-[1000] flex items-center justify-between pointer-events-none">
                <span className="bg-slate-900/90 backdrop-blur-md text-white text-[11px] px-3 py-1.5 rounded-full font-mono border border-slate-750 shadow-lg pointer-events-auto">
                  📍 Pin: {newHubLat.toFixed(4)}° N, {newHubLng.toFixed(4)}° E
                </span>
                <span className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full font-bold shadow-lg hidden sm:inline-block">
                  Drag pin or tap map to set coordinates
                </span>
              </div>
            </div>

            {/* Right: Hub Details & Form Controls */}
            <div className="w-full md:w-5/12 flex flex-col bg-slate-900 p-5 sm:p-6 justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[#2563EB]" />
                    <h3 className="text-sm sm:text-base font-bold text-white">Add Serviceable Hub</h3>
                  </div>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Auto-detected Lat/Long pill */}
                <div className="p-3 rounded-2xl bg-blue-950/40 border border-[#2563EB]/40 mb-4 flex items-center justify-between text-xs text-blue-200">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-[#2563EB] animate-pulse" />
                    <span>
                      Lat/Long synced from map pin:
                    </span>
                  </div>
                  <span className="font-mono font-bold text-white bg-[#2563EB]/30 px-2 py-0.5 rounded border border-[#2563EB]/50">
                    {newHubLat.toFixed(4)}, {newHubLng.toFixed(4)}
                  </span>
                </div>

                <form id="add-hub-form" onSubmit={handleCreateHub} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Hub Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newHubName}
                        onChange={(e) => setNewHubName(e.target.value)}
                        placeholder="e.g. Davangere Hub"
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-[#2563EB]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Hub Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={newHubCode}
                        onChange={(e) => setNewHubCode(e.target.value)}
                        placeholder="e.g. DVG-01"
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Area / Locality
                      </label>
                      <input
                        type="text"
                        value={newHubArea}
                        onChange={(e) => setNewHubArea(e.target.value)}
                        placeholder="Davangere"
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-[#2563EB]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={newHubPincode}
                        onChange={(e) => setNewHubPincode(e.target.value)}
                        placeholder="577001"
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  </div>

                  {/* Latitude and Longitude with direct two-way map sync */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Latitude (from map)
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={newHubLat}
                        onChange={(e) => handleManualLatChange(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs outline-none focus:border-[#2563EB]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Longitude (from map)
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={newHubLng}
                        onChange={(e) => handleManualLngChange(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs outline-none focus:border-[#2563EB]"
                      />
                    </div>
                  </div>

                  {/* Radius Slider with live circle preview on map */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <span>Service Radius</span>
                      <strong className="text-[#2563EB] font-mono text-sm font-black">
                        {newHubRadius} km
                      </strong>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={30}
                      step={0.5}
                      value={newHubRadius}
                      onChange={(e) => handleRadiusSliderChange(parseFloat(e.target.value))}
                      className="w-full accent-[#2563EB] cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                      <span>2 km</span>
                      <span>Circle updates live on map</span>
                      <span>30 km</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Base ETA (Mins)
                    </label>
                    <input
                      type="number"
                      value={newHubBaseEta}
                      onChange={(e) => setNewHubBaseEta(parseInt(e.target.value) || 15)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </form>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-hub-form"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{isSubmitting ? 'Creating...' : 'Create Hub'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
