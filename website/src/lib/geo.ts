import type { ServiceHub, ServiceabilityResult } from '../types';

export const DEFAULT_SERVICE_HUBS: ServiceHub[] = [
  {
    id: 'hub-dvg-vid',
    code: 'DVG-VID-01',
    name: 'Vidyanagar Hub',
    area: 'Vidyanagar',
    city: 'Davangere',
    pincode: '577005',
    fullAddress: 'Main Road, Vidyanagar, Davangere, Karnataka 577005',
    latitude: 14.4485,
    longitude: 75.9189,
    radiusKm: 10.0,
    baseEtaMinutes: 15,
    perKmEtaMinutes: 2.0,
    isActive: true,
    order: 1,
  },
  {
    id: 'hub-dvg-mcc',
    code: 'DVG-MCC-02',
    name: "MCC 'B' Block Hub",
    area: 'MCC B Block',
    city: 'Davangere',
    pincode: '577004',
    fullAddress: 'Near Kuvempu Park, MCC B Block, Davangere, Karnataka 577004',
    latitude: 14.4690,
    longitude: 75.9220,
    radiusKm: 10.0,
    baseEtaMinutes: 18,
    perKmEtaMinutes: 2.0,
    isActive: true,
    order: 2,
  },
  {
    id: 'hub-dvg-pb',
    code: 'DVG-PBR-03',
    name: 'PB Road Central Hub',
    area: 'PB Road, Clock Tower',
    city: 'Davangere',
    pincode: '577002',
    fullAddress: 'PB Road Central, City Center, Davangere, Karnataka 577002',
    latitude: 14.4660,
    longitude: 75.9260,
    radiusKm: 12.0,
    baseEtaMinutes: 15,
    perKmEtaMinutes: 2.0,
    isActive: true,
    order: 3,
  },
  {
    id: 'hub-dvg-nij',
    code: 'DVG-NIJ-04',
    name: 'Nijalingappa Layout Hub',
    area: 'Nijalingappa Layout',
    city: 'Davangere',
    pincode: '577004',
    fullAddress: 'Ring Road, Nijalingappa Layout, Davangere, Karnataka 577004',
    latitude: 14.4550,
    longitude: 75.9350,
    radiusKm: 10.0,
    baseEtaMinutes: 20,
    perKmEtaMinutes: 2.0,
    isActive: true,
    order: 4,
  },
  {
    id: 'hub-dvg-ktj',
    code: 'DVG-KTJ-05',
    name: 'KTJ Nagar Hub',
    area: 'KTJ Nagar',
    city: 'Davangere',
    pincode: '577002',
    fullAddress: 'Station Road, KTJ Nagar, Davangere, Karnataka 577002',
    latitude: 14.4750,
    longitude: 75.9120,
    radiusKm: 10.0,
    baseEtaMinutes: 18,
    perKmEtaMinutes: 2.0,
    isActive: true,
    order: 5,
  },
];

/**
 * Haversine formula to compute geodesic distance between two points in km.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Estimates technician arrival time in minutes.
 */
export function estimateEtaMinutes(
  distanceKm: number,
  baseEtaMinutes = 15,
  perKmEtaMinutes = 2
): number {
  const calculated = Math.round(baseEtaMinutes + distanceKm * perKmEtaMinutes);
  return Math.max(15, Math.min(calculated, 120));
}

/**
 * Checks serviceability of given coordinates against active hubs.
 */
export function checkServiceability(
  latitude: number,
  longitude: number,
  hubs: ServiceHub[]
): ServiceabilityResult {
  const activeHubs = hubs.filter((h) => h.isActive);
  if (activeHubs.length === 0) {
    return {
      isServiceable: false,
      nearestHub: null,
      distanceKm: 0,
      etaMinutes: 0,
    };
  }

  let nearestHub = activeHubs[0];
  let minDistance = calculateDistanceKm(
    latitude,
    longitude,
    nearestHub.latitude,
    nearestHub.longitude
  );

  for (const hub of activeHubs) {
    const dist = calculateDistanceKm(latitude, longitude, hub.latitude, hub.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearestHub = hub;
    }
  }

  const isServiceable = minDistance <= nearestHub.radiusKm;
  const etaMinutes = estimateEtaMinutes(
    minDistance,
    nearestHub.baseEtaMinutes,
    nearestHub.perKmEtaMinutes
  );

  return {
    isServiceable,
    nearestHub,
    distanceKm: minDistance,
    etaMinutes,
  };
}

// In-memory cache for reverse geocoding to prevent excessive requests
const geocodeCache = new Map<string, { area: string; city: string; pincode: string; fullAddress: string }>();

/**
 * Real Reverse-Geocoding via OpenStreetMap Nominatim (Free, no API key).
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ area: string; city: string; pincode: string; fullAddress: string }> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('Nominatim request failed');
    const data = await res.json();
    const addr = data.address || {};

    const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.subdistrict;
    const road = addr.road || addr.pedestrian || addr.street;
    const city = addr.city || addr.town || addr.village || addr.county || 'Davangere';
    const state = addr.state || 'Karnataka';
    const pincode = addr.postcode || '577002';

    const areaName = suburb ? (road ? `${road}, ${suburb}` : suburb) : (road || `${city} Central`);
    const fullAddress = data.display_name || `${areaName}, ${city}, ${state} - ${pincode}`;

    const result = {
      area: areaName,
      city,
      pincode,
      fullAddress,
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('[ReverseGeocode Fallback]', error);
    // Fallback coordinates representation
    return {
      area: `Location (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`,
      city: 'Davangere',
      pincode: '577002',
      fullAddress: `Detected coordinates [${lat.toFixed(4)}, ${lng.toFixed(4)}], Davangere, Karnataka`,
    };
  }
}

export interface PlaceSearchResult {
  placeId: string;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  city: string;
  pincode: string;
}

/**
 * Place Search Autocomplete via OpenStreetMap Nominatim.
 */
export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&countrycodes=in&limit=6&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();

    return data.map((item: any) => {
      const addr = item.address || {};
      const city = addr.city || addr.town || addr.county || 'Davangere';
      const pincode = addr.postcode || '';
      return {
        placeId: String(item.place_id || Math.random()),
        name: item.name || item.display_name.split(',')[0],
        displayName: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        city,
        pincode,
      };
    });
  } catch (err) {
    console.warn('[searchPlaces error]', err);
    return [];
  }
}
