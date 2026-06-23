import test from "node:test";
import assert from "node:assert/strict";
import { fastMarch } from "./lib/eikonal.mjs";
import { G } from "./lib/geo.mjs";

// A flat, uniform synthetic ocean so we can check the solver against the
// closed-form answer T = distance / sqrt(g*depth).
function uniformGrid(rows, cols, depth, h) {
  return {
    rows,
    cols,
    periodicX: false,
    dy: h,
    depthAt: () => depth,
    dxAt: () => h,
  };
}

const H = 2000; // 2 km cells
const DEPTH = 4000; // 4 km deep ocean
const SPEED = Math.sqrt(G * DEPTH); // ~198 m/s
const N = 121;
const CTR = 60;

test("source cell has zero travel time", () => {
  const T = fastMarch(uniformGrid(N, N, DEPTH, H), CTR, CTR);
  assert.equal(T[CTR * N + CTR], 0);
});

test("on-axis travel time matches distance / speed (<1% error)", () => {
  const T = fastMarch(uniformGrid(N, N, DEPTH, H), CTR, CTR);
  const cells = 40;
  const got = T[CTR * N + (CTR + cells)];
  const expected = (cells * H) / SPEED;
  const err = Math.abs(got - expected) / expected;
  assert.ok(err < 0.01, `on-axis error ${(err * 100).toFixed(2)}% (got ${got.toFixed(1)}s, want ${expected.toFixed(1)}s)`);
});

test("diagonal travel time matches Euclidean distance / speed (<4% error)", () => {
  const T = fastMarch(uniformGrid(N, N, DEPTH, H), CTR, CTR);
  const d = 40;
  const got = T[(CTR + d) * N + (CTR + d)];
  const expected = (Math.SQRT2 * d * H) / SPEED;
  const err = Math.abs(got - expected) / expected;
  assert.ok(err < 0.04, `diagonal error ${(err * 100).toFixed(2)}% (got ${got.toFixed(1)}s, want ${expected.toFixed(1)}s)`);
});

test("land barrier casts a true shadow (unreachable = Infinity)", () => {
  // A solid land wall at column 80 with no gap; cells beyond it can't be reached.
  const grid = {
    rows: N,
    cols: N,
    periodicX: false,
    dy: H,
    depthAt: (r, c) => (c === 80 ? -100 : DEPTH),
    dxAt: () => H,
  };
  const T = fastMarch(grid, CTR, CTR);
  assert.ok(Number.isFinite(T[CTR * N + 70]), "near side should be reached");
  assert.ok(!Number.isFinite(T[CTR * N + 100]), "far side of wall must be unreachable");
});
