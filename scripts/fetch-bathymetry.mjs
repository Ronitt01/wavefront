// Fetch global bathymetry from AWS Terrain Tiles (public, CC, no auth) and
// reproject the Web-Mercator "terrarium" tiles into a clean equirectangular
// Int16 grid of ocean depth/land height in meters — the input the Eikonal
// baker runs on.
//
//   node scripts/fetch-bathymetry.mjs [zoom=4]
//
// Output: scripts/data/bathymetry.bin (Int16LE, rows*cols) + bathymetry.json

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "../node_modules/pngjs/lib/png.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "data");

const ZOOM = Number(process.argv[2] ?? 4);
const TILE = 256;
const SIZE = TILE * 2 ** ZOOM; // mosaic px per side
const TILES = 2 ** ZOOM;
const BASE = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium";

// Equirectangular target grid (Mercator can't reach the poles; ±85 covers every
// ocean basin that matters for tsunamis).
const LAT_MAX = 85;
const LAT_MIN = -85;
const ROWS = 1024;
const COLS = 2048;

const decode = (r, g, b) => r * 256 + g + b / 256 - 32768; // terrarium -> meters

async function fetchTile(x, y, attempt = 0) {
  try {
    const res = await fetch(`${BASE}/${ZOOM}/${x}/${y}.png`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return PNG.sync.read(Buffer.from(await res.arrayBuffer()));
  } catch (e) {
    if (attempt < 4) {
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      return fetchTile(x, y, attempt + 1);
    }
    throw new Error(`tile ${x},${y} failed: ${e.message}`);
  }
}

// Build the full Mercator elevation mosaic with a bounded concurrency pool.
async function buildMosaic() {
  const mosaic = new Float32Array(SIZE * SIZE);
  const jobs = [];
  for (let x = 0; x < TILES; x++) for (let y = 0; y < TILES; y++) jobs.push([x, y]);

  let done = 0;
  const CONCURRENCY = 16;
  let next = 0;
  async function worker() {
    while (next < jobs.length) {
      const [x, y] = jobs[next++];
      const png = await fetchTile(x, y);
      const ox = x * TILE;
      const oy = y * TILE;
      for (let py = 0; py < TILE; py++) {
        const rowBase = (oy + py) * SIZE + ox;
        const src = py * TILE * 4;
        for (let px = 0; px < TILE; px++) {
          const i = src + px * 4;
          mosaic[rowBase + px] = decode(png.data[i], png.data[i + 1], png.data[i + 2]);
        }
      }
      done++;
      if (done % 16 === 0 || done === jobs.length) {
        process.stdout.write(`\r  tiles ${done}/${jobs.length}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  process.stdout.write("\n");
  return mosaic;
}

function reproject(mosaic) {
  const out = new Int16Array(ROWS * COLS);
  const dLat = (LAT_MAX - LAT_MIN) / ROWS;
  const dLon = 360 / COLS;

  for (let r = 0; r < ROWS; r++) {
    const lat = LAT_MAX - (r + 0.5) * dLat;
    const latRad = (lat * Math.PI) / 180;
    // Mercator y pixel for this latitude
    const my = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * SIZE;
    const y0 = Math.max(0, Math.min(SIZE - 1, Math.floor(my)));
    const y1 = Math.min(SIZE - 1, y0 + 1);
    const fy = my - y0;
    for (let c = 0; c < COLS; c++) {
      const lon = -180 + (c + 0.5) * dLon;
      const mx = ((lon + 180) / 360) * SIZE;
      const x0 = Math.max(0, Math.min(SIZE - 1, Math.floor(mx)));
      const x1 = (x0 + 1) % SIZE; // longitude wraps
      const fx = mx - x0;
      // bilinear
      const v00 = mosaic[y0 * SIZE + x0];
      const v10 = mosaic[y0 * SIZE + x1];
      const v01 = mosaic[y1 * SIZE + x0];
      const v11 = mosaic[y1 * SIZE + x1];
      const top = v00 + (v10 - v00) * fx;
      const bot = v01 + (v11 - v01) * fx;
      const v = top + (bot - top) * fy;
      out[r * COLS + c] = Math.max(-32768, Math.min(32767, Math.round(v)));
    }
  }
  return out;
}

async function main() {
  console.log(`Fetching bathymetry at zoom ${ZOOM} (${TILES}x${TILES} tiles, ${SIZE}px mosaic)...`);
  const mosaic = await buildMosaic();
  console.log(`Reprojecting to ${ROWS}x${COLS} equirectangular (lat ${LAT_MIN}..${LAT_MAX})...`);
  const grid = reproject(mosaic);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "bathymetry.bin"), Buffer.from(grid.buffer));
  const meta = { rows: ROWS, cols: COLS, latMax: LAT_MAX, latMin: LAT_MIN, lonMin: -180, lonMax: 180, dtype: "int16", units: "meters", note: "elevation; ocean depth = -value" };
  fs.writeFileSync(path.join(OUT_DIR, "bathymetry.json"), JSON.stringify(meta, null, 2));

  // quick sanity readout
  let min = Infinity, max = -Infinity, ocean = 0;
  for (const v of grid) {
    if (v < min) min = v;
    if (v > max) max = v;
    if (v < 0) ocean++;
  }
  console.log(`Done. range ${min}..${max} m, ocean ${(100 * ocean / grid.length).toFixed(1)}%`);
  console.log(`Wrote ${OUT_DIR}/bathymetry.bin (${(grid.byteLength / 1e6).toFixed(1)} MB)`);
}

main().catch((e) => {
  console.error("FETCH FAILED:", e.message);
  process.exit(1);
});
