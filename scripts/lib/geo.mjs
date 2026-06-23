// Geodesy + physics constants shared by the offline baker.

export const R_EARTH_M = 6371008.8; // mean Earth radius (meters)
export const G = 9.80665; // gravitational acceleration (m/s^2)

export const toRad = (d) => (d * Math.PI) / 180;
export const toDeg = (r) => (r * 180) / Math.PI;

/** Great-circle distance in meters between two lat/lon points. */
export function haversineMeters(lat1, lon1, lat2, lon2) {
  const p1 = toRad(lat1);
  const p2 = toRad(lat2);
  const dp = toRad(lat2 - lat1);
  const dl = toRad(lon2 - lon1);
  const a =
    Math.sin(dp / 2) ** 2 +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R_EARTH_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Shallow-water tsunami phase speed: c = sqrt(g * depth).
 * Long-wavelength tsunamis "feel" the bottom everywhere, so their speed is set
 * by ocean depth alone — ~200 m/s (jetliner speed) over deep basins, slowing to
 * tens of m/s on shelves. This is the physics the whole product visualizes.
 */
export function waveSpeed(depthMeters, minDepth = 10) {
  return Math.sqrt(G * Math.max(depthMeters, minDepth));
}
