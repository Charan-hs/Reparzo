/**
 * Haversine formula to compute great-circle distance between two points on the Earth (in km).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

/**
 * Estimates technician travel arrival time in minutes based on distance.
 */
export function estimateEtaMinutes(
  distanceKm: number,
  baseEtaMinutes = 15,
  perKmEtaMinutes = 2
): number {
  const calculated = Math.round(baseEtaMinutes + distanceKm * perKmEtaMinutes);
  return Math.max(15, Math.min(calculated, 120));
}
