// Fast Marching Method (Sethian) for the tsunami travel-time field.
//
// This is a TRUE front solve, not a radial lookup: the wavefront propagates
// cell-to-cell at the local shallow-water speed c = sqrt(g*depth), so it
// decelerates over continental shelves, races over deep trenches, and bends
// around islands leaving honest shadow zones behind them. Land is a hard
// barrier. Longitude wraps (the Pacific front crosses the antimeridian).
//
// Output: Float32Array of arrival time in SECONDS per cell (Infinity = land or
// unreachable). The grid object supplies geometry + depth.

import { G } from "./geo.mjs";

const FAR = 0;
const NARROW = 1;
const FROZEN = 2;

/** Binary min-heap of [time, index] with lazy deletion. */
class MinHeap {
  constructor() {
    this.a = [];
  }
  get size() {
    return this.a.length;
  }
  push(t, i) {
    const a = this.a;
    a.push([t, i]);
    let c = a.length - 1;
    while (c > 0) {
      const p = (c - 1) >> 1;
      if (a[p][0] <= a[c][0]) break;
      [a[p], a[c]] = [a[c], a[p]];
      c = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;
      let p = 0;
      const n = a.length;
      for (;;) {
        const l = 2 * p + 1;
        const r = l + 1;
        let s = p;
        if (l < n && a[l][0] < a[s][0]) s = l;
        if (r < n && a[r][0] < a[s][0]) s = r;
        if (s === p) break;
        [a[s], a[p]] = [a[p], a[s]];
        p = s;
      }
    }
    return top;
  }
}

/**
 * Godunov upwind solution of the Eikonal equation at one cell.
 * Tx/Ty = smallest arrival among the x/y neighbours; hx/hy = their spacings (m);
 * s = slowness (1/speed). Falls back to the 1-D update when the 2-D root would
 * violate causality (root must exceed both contributing neighbours).
 */
function solveEikonal(Tx, hx, Ty, hy, s) {
  const hasX = Number.isFinite(Tx);
  const hasY = Number.isFinite(Ty);
  if (!hasX && !hasY) return Infinity;
  if (!hasY) return Tx + hx * s;
  if (!hasX) return Ty + hy * s;

  const ix2 = 1 / (hx * hx);
  const iy2 = 1 / (hy * hy);
  const a = ix2 + iy2;
  const b = -2 * (Tx * ix2 + Ty * iy2);
  const c = Tx * Tx * ix2 + Ty * Ty * iy2 - s * s;
  const disc = b * b - 4 * a * c;
  if (disc >= 0) {
    const t = (-b + Math.sqrt(disc)) / (2 * a);
    if (t >= Tx && t >= Ty) return t; // causal
  }
  // non-causal -> 1-D update from the nearer axis
  return Math.min(Tx + hx * s, Ty + hy * s);
}

/**
 * @param grid  { cols, rows, periodicX, dy, depthAt(r,c), dxAt(r) }
 *              depthAt returns ocean depth in meters (>0 ocean, <=0 land).
 * @returns Float32Array (cols*rows) of arrival time in seconds.
 */
export function fastMarch(grid, srcRow, srcCol, opts = {}) {
  const { cols, rows, dy, periodicX = true } = grid;
  const minDepth = opts.minDepth ?? 10;
  const N = cols * rows;

  // Float64 during the solve so the value pushed to the heap exactly matches the
  // value stored in T — otherwise float32 rounding makes the `t > T[i]` stale
  // guard misfire and the front stalls. Cast to Float32 only at export.
  const T = new Float64Array(N).fill(Infinity);
  const state = new Uint8Array(N); // FAR/NARROW/FROZEN
  const heap = new MinHeap();

  // Resolve a column `delta` away. Longitude wraps on the real globe; off the
  // edges of a non-periodic grid there is no neighbour (returns -1).
  const colNeighbor = (c, delta) => {
    const nc = c + delta;
    if (periodicX) return (nc + cols) % cols;
    return nc < 0 || nc >= cols ? -1 : nc;
  };
  const idx = (r, c) => r * cols + c;
  const isOcean = (r, c) => grid.depthAt(r, c) > 0;

  const src = idx(srcRow, srcCol);
  T[src] = 0;
  state[src] = NARROW;
  heap.push(0, src);

  // precompute east-west spacing per row (varies with latitude)
  const dxRow = new Float64Array(rows);
  for (let r = 0; r < rows; r++) dxRow[r] = grid.dxAt(r);

  while (heap.size > 0) {
    const [t, i] = heap.pop();
    if (state[i] === FROZEN) continue; // stale heap entry
    if (t > T[i]) continue;
    state[i] = FROZEN;

    const r = (i / cols) | 0;
    const c = i - r * cols;

    // visit 4-connected neighbours (skip non-existent off-edge columns)
    const cl = colNeighbor(c, -1);
    const cr = colNeighbor(c, 1);
    const nb = [];
    if (cl >= 0) nb.push([r, cl]);
    if (cr >= 0) nb.push([r, cr]);
    nb.push([r - 1, c], [r + 1, c]);

    for (const [nr, nc] of nb) {
      if (nr < 0 || nr >= rows) continue;
      const ni = idx(nr, nc);
      if (state[ni] === FROZEN) continue;
      if (!isOcean(nr, nc)) continue; // land barrier

      const hx = dxRow[nr];
      const hy = dy;
      // best x- and y-neighbour arrival of THIS candidate cell
      const xl = colNeighbor(nc, -1);
      const xr = colNeighbor(nc, 1);
      const Tx = Math.min(
        xl >= 0 ? T[idx(nr, xl)] : Infinity,
        xr >= 0 ? T[idx(nr, xr)] : Infinity,
      );
      const Ty = Math.min(
        nr > 0 ? T[idx(nr - 1, nc)] : Infinity,
        nr < rows - 1 ? T[idx(nr + 1, nc)] : Infinity,
      );
      const depth = grid.depthAt(nr, nc);
      const speed = Math.sqrt(G * Math.max(depth, minDepth));
      const cand = solveEikonal(Tx, hx, Ty, hy, 1 / speed);

      if (cand < T[ni]) {
        T[ni] = cand;
        state[ni] = NARROW;
        heap.push(cand, ni);
      }
    }
  }

  return T;
}
