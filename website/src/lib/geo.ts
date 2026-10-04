import type { ServiceHub, ServiceabilityResult } from '../types';

export const DEFAULT_SERVICE_HUBS: ServiceHub[] = [
  {
    id: 'hub-blr-hsr',
    code: 'BLR-HSR-01',
    name: 'HSR Layout Sector 2 Hub',
    area: 'HSR Layout, Sector 2',
    city: 'Bengaluru',
    pincode: '560102',
    fullAddress: '14th Main Road, HSR Layout Sector 2, Bengaluru, Karnataka 560102',
    latitude: 12.9116,
    longitude: 77.6389,
    radiusKm: 8.0,
    baseEtaMinutes: 18,
    perKmEtaMinutes: 2.0,
    isActive: true,
    order: 1,
  },
  {
    id: 'hub-blr-kor',
    code: 'BLR-KOR-02',
    name: 'Koramangala 4th Block Hub',
    area: 'Koramangala 4th Block',
    city: 'Bengaluru',
    pincode: '560034',
    fullAddress: '80 Feet Road, 4th Block Koramangala, Bengaluru, Karnataka 560034',
    latitude: 12.9345,
    longitude: 77.6264,
    radiusKm: 7.5,
    baseEtaMinutes: 20,
    perKmEtaMinutes: 2.2,
    isActive: true,
    order: 2,
  },
  {
    id: 'hub-blr-ind',
    code: 'BLR-IND-03',
    name: 'Indiranagar 100ft Road Hub',
    area: 'Indiranagar 100ft Road',
    city: 'Bengaluru',
    pincode: '560038',
    fullAddress: '12th Main, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    latitude: 12.9719,
    longitude: 77.6412,
    radiusKm: 8.0,
    baseEtaMinutes: 22,
    perKmEtaMinutes: 2.0,
    isActive: true,
    order: 3,
  },
  {
    id: 'hub-blr-whf',
    code: 'BLR-WHF-04',
    name: 'Whitefield Inner Circle Hub',
    area: 'Whitefield Inner Circle',
    city: 'Bengaluru',
    pincode: '560066',
    fullAddress: 'ITPL Main Road, Whitefield, Bengaluru, Karnataka 560066',
    latitude: 12.9698,
    longitude: 77.7500,
    radiusKm: 10.0,
    baseEtaMinutes: 25,
    perKmEtaMinutes: 2.5,
    isActive: true,
    order: 4,
  },
  {
    id: 'hub-blr-jay',
    code: 'BLR-JAY-05',
    name: 'Jayanagar 4th T Block Hub',
    area: 'Jayanagar 4th T Block',
    city: 'Bengaluru',
    pincode: '560041',
    fullAddress: '11th Main, 4th Block Jayanagar, Bengaluru, Karnataka 560041',
    latitude: 12.9250,
    longitude: 77.5838,
    radiusKm: 7.0,
    baseEtaMinutes: 20,
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
    const city = addr.city || addr.town || addr.village || addr.county || 'Bengaluru';
    const state = addr.state || 'Karnataka';
    const pincode = addr.postcode || '560001';

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
      city: 'Bengaluru',
      pincode: '560001',
      fullAddress: `Detected coordinates [${lat.toFixed(4)}, ${lng.toFixed(4)}], Bengaluru, Karnataka`,
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
      const city = addr.city || addr.town || addr.county || 'Bengaluru';
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
