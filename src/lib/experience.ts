/**
 * Experience scroll store — normalized 0..1 progress through the scrollytelling
 * hero (separate from the global page scroll). The 3D scene reads it every frame;
 * the HUD subscribes. One timeline, three acts.
 */

let _p = 0;
const subs = new Set<(p: number) => void>();

export function setExperienceProgress(p: number): void {
  const c = p < 0 ? 0 : p > 1 ? 1 : p;
  if (c === _p) return;
  _p = c;
  for (const f of subs) f(c);
}
export function getExperienceProgress(): number {
  return _p;
}
export function onExperienceProgress(f: (p: number) => void): () => void {
  subs.add(f);
  f(_p);
  return () => subs.delete(f);
}

// Act boundaries within the experience timeline.
export const ACTS = {
  introEnd: 0.12, // wide on the epicenter, before the wave
  crossEnd: 0.8, // wave has reached the featured coast
};

/** 0..1 progress through the ocean crossing. */
export function crossingT(p: number): number {
  const t = (p - ACTS.introEnd) / (ACTS.crossEnd - ACTS.introEnd);
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/** Modeled minutes elapsed since the quake at this scroll position. */
export function minutesAt(p: number, arrivalMinutes: number): number {
  return crossingT(p) * arrivalMinutes;
}

/** Has the wave reached the coast (brief reveals)? */
export function hasLanded(p: number): boolean {
  return p >= ACTS.crossEnd;
}

export const smoothstep = (a: number, b: number, x: number): number => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Shortest-arc angular interpolation (radians). */
export function lerpAngle(a: number, b: number, t: number): number {
  let d = ((b - a + Math.PI) % (2 * Math.PI)) - Math.PI;
  if (d < -Math.PI) d += 2 * Math.PI;
  return a + d * t;
}
