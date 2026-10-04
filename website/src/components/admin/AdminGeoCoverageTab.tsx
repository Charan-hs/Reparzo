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
  AlertTriangle
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../../store/useAppStore';
import type { ServiceHub } from '../../types';
import { checkServiceability, reverseGeocode } from '../../lib/geo';
import { toast } from 'sonner';

export const AdminGeoCoverageTab: React.FC = () => {
  const { 
    serviceHubs, 
    addServiceHub, 
    updateServiceHub, 
    deleteServiceHub, 
    fetchServiceHubs 
  } = useAppStore();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const testMarkerRef = useRef<L.Marker | null>(null);

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

  // Sandbox Tester Coordinates
  const [testCoords, setTestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [testResult, setTestResult] = useState<ReturnType<typeof checkServiceability> | null>(null);

  // Initialize and maintain the Leaflet Map
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

      // Click on map to test location or pick coordinate
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
              <div style="background:#EF4444;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:11px;">
                ?
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });
          testMarkerRef.current = L.marker([lat, lng], { icon: testIcon }).addTo(map);
        }
      });

      mapRef.current = map;
    }

    // Refresh hub markers and circles
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

  // Handle radius adjustment for a hub
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

      toast.success(`New hub "${newHubName}" created with ${newHubRadius} km coverage!`);
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
            Configure delivery hubs and tune real-time dispatch radius (in km) across the city
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
              💡 Tap any location on map to test customer serviceability
            </span>
          </div>

          <div ref={mapContainerRef} className="flex-1 w-full h-full z-0" />

          {/* Sandbox Test Result Strip */}
          {testResult && testCoords && (
            <div className={`p-3 border-t text-xs flex items-center justify-between ${
              testResult.isServiceable
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
                : 'bg-amber-950/80 border-amber-800 text-amber-200'
            }`}>
              <div className="flex items-center gap-2">
                {testResult.isServiceable ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                )}
                <span>
                  <strong>Tested Pin [{testCoords.lat.toFixed(3)}, {testCoords.lng.toFixed(3)}]:</strong>{' '}
                  {testResult.isServiceable
                    ? `SERVICEABLE by "${testResult.nearestHub?.name}" (~${testResult.distanceKm} km, ETA ${testResult.etaMinutes}m)`
                    : `OUT OF AREA (Nearest hub is ${testResult.distanceKm} km away)`}
                </span>
              </div>
              <button
                onClick={() => setTestResult(null)}
                className="text-[10px] uppercase font-bold text-slate-400 hover:text-white"
              >
                Clear
              </button>
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

      {/* ── Add New Hub Modal ──────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#2563EB]" />
                Add Serviceable Hub
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHub} className="space-y-3.5">
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
                    placeholder="e.g. Electronic City Phase 1"
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
                    placeholder="e.g. BLR-EC-06"
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
                    placeholder="Electronic City"
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
                    placeholder="560100"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newHubLat}
                    onChange={(e) => setNewHubLat(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newHubLng}
                    onChange={(e) => setNewHubLng(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Service Radius (km): <strong className="text-[#2563EB]">{newHubRadius} km</strong>
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={30}
                    step={0.5}
                    value={newHubRadius}
                    onChange={(e) => setNewHubRadius(parseFloat(e.target.value))}
                    className="w-full accent-[#2563EB]"
                  />
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
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Creating...' : 'Create Hub'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
