/**
 * Module-level scroll store.
 *
 * Lenis drives smooth scrolling on the document and pushes a normalized
 * progress value (0..1 over the whole page) into here. The R3F scenes read
 * `getScrollProgress()` inside `useFrame` every frame — no React state, no
 * re-renders, no jank. HTML overlays can subscribe via `onScrollProgress`.
 *
 * This is the single source of truth that keeps the 3D camera, the isochrone
 * ring, and the HTML sections locked to one timeline.
 */

let _progress = 0;
const listeners = new Set<(p: number) => void>();

export function setScrollProgress(p: number): void {
  const clamped = p < 0 ? 0 : p > 1 ? 1 : p;
  if (clamped === _progress) return;
  _progress = clamped;
  for (const l of listeners) l(_progress);
}

export function getScrollProgress(): number {
  return _progress;
}

export function onScrollProgress(listener: (p: number) => void): () => void {
  listeners.add(listener);
  listener(_progress);
  return () => listeners.delete(listener);
}

/**
 * Map the global 0..1 progress onto a sub-range [start, end], returning a fresh
 * 0..1 within that window (clamped). Lets each scene own a slice of the scroll.
 */
export function subRange(p: number, start: number, end: number): number {
  if (end <= start) return 0;
  const t = (p - start) / (end - start);
  return t < 0 ? 0 : t > 1 ? 1 : t;
}
