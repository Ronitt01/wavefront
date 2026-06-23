// Bakes the tsunami travel-time field for each scenario from real bathymetry.
//
//   node scripts/bake.mjs
//
// For each scenario: run the Eikonal solver from the epicenter, sample the
// arrival time at the featured coast, and export a downsampled travel-time
// field (minutes) the GPU samples to draw the isochrone ring.
//
// Outputs:
//   public/scenarios/<id>.bin        Float32 field (minutes; -1 = land/unreached)
//   public/scenarios/manifest.json   field dims, bounds, epicenter, coast, maxMinutes
//   src/lib/baked.json               computed { arrivalMinutes, distanceKm } per id

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadGrid, nearestOcean } from "./lib/grid.mjs";
import { fastMarch } from "./lib/eikonal.mjs";
import { haversineMeters } from "./lib/geo.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA = path.join(__dirname, "data");
const PUB = path.join(ROOT, "public", "scenarios");

// Exported field resolution (smooth field -> safe to downsample for the web).
const FR = 512;
const FC = 1024;

const scenarios = JSON.parse(
  fs.readFileSync(path.join(__dirname, "scenarios.epicenters.json"), "utf8"),
);

console.log("Loading bathymetry...");
const grid = loadGrid(
  path.join(DATA, "bathymetry.bin"),
  path.join(DATA, "bathymetry.json"),
);
console.log(`Grid ${grid.rows}x${grid.cols}`);

/** Downsample the full-res seconds field to FR x FC minutes (block-min keeps fronts). */
function exportField(T) {
  const out = new Float32Array(FR * FC);
  const rs = grid.rows / FR;
  const cs = grid.cols / FC;
  let maxMin = 0;
  for (let fr = 0; fr < FR; fr++) {
    for (let fc = 0; fc < FC; fc++) {
      let best = Infinity;
      const r0 = Math.floor(fr * rs);
      const r1 = Math.floor((fr + 1) * rs);
      const c0 = Math.floor(fc * cs);
      const c1 = Math.floor((fc + 1) * cs);
      for (let r = r0; r < r1; r++) {
        for (let c = c0; c < c1; c++) {
          const v = T[r * grid.cols + c];
          if (v < best) best = v;
        }
      }
      const minutes = Number.isFinite(best) ? best / 60 : -1;
      out[fr * FC + fc] = minutes;
      if (minutes > maxMin) maxMin = minutes;
    }
  }
  return { field: out, maxMinutes: maxMin };
}

fs.mkdirSync(PUB, { recursive: true });
const baked = {};
const manifest = { fieldRows: FR, fieldCols: FC, bounds: grid.bounds, scenarios: [] };

for (const s of scenarios) {
  const [er0, ec0] = grid.rcOf(s.epicenter.lat, s.epicenter.lon);
  const [er, ec] = nearestOcean(grid, er0, ec0);
  const [cr0, cc0] = grid.rcOf(s.coast.lat, s.coast.lon);
  const [cr, cc] = nearestOcean(grid, cr0, cc0);

  const t0 = Date.now();
  const T = fastMarch(grid, er, ec);
  const solveMs = Date.now() - t0;

  const arrivalSec = T[cr * grid.cols + cc];
  const arrivalMin = arrivalSec / 60;
  const distKm = haversineMeters(s.epicenter.lat, s.epicenter.lon, s.coast.lat, s.coast.lon) / 1000;

  const { field, maxMinutes } = exportField(T);
  fs.writeFileSync(path.join(PUB, `${s.id}.bin`), Buffer.from(field.buffer));

  baked[s.id] = {
    arrivalMinutes: Number.isFinite(arrivalMin) ? Math.round(arrivalMin * 10) / 10 : null,
    distanceKm: Math.round(distKm),
  };

  manifest.scenarios.push({
    id: s.id,
    file: `/scenarios/${s.id}.bin`,
    epicenter: s.epicenter,
    epicenterCell: { lat: grid.latOfRow(er), lon: grid.lonOfCol(ec) },
    coast: { ...s.coast, arrivalMinutes: baked[s.id].arrivalMinutes, distanceKm: baked[s.id].distanceKm },
    maxMinutes: Math.round(maxMinutes),
  });

  const hrs = Number.isFinite(arrivalMin) ? (arrivalMin / 60).toFixed(1) : "INF";
  console.log(
    `${s.id.padEnd(14)} solve ${String(solveMs).padStart(5)}ms  ` +
      `${s.coast.label.padEnd(22)} arrival ${Number.isFinite(arrivalMin) ? arrivalMin.toFixed(0).padStart(4) : " INF"} min (${hrs} h)  ` +
      `dist ${distKm.toFixed(0)} km`,
  );
}

// Global bathymetry texture for the globe shader (the globe IS the data).
{
  const EBR = 512;
  const EBC = 1024;
  const eb = new Int16Array(EBR * EBC);
  const rs = grid.rows / EBR;
  const cs = grid.cols / EBC;
  for (let r = 0; r < EBR; r++) {
    for (let c = 0; c < EBC; c++) {
      let sum = 0;
      let n = 0;
      const r0 = Math.floor(r * rs);
      const r1 = Math.floor((r + 1) * rs);
      const c0 = Math.floor(c * cs);
      const c1 = Math.floor((c + 1) * cs);
      for (let rr = r0; rr < r1; rr++) {
        for (let cc = c0; cc < c1; cc++) {
          sum += grid.elev[rr * grid.cols + cc];
          n++;
        }
      }
      eb[r * EBC + c] = Math.round(sum / n);
    }
  }
  fs.mkdirSync(path.join(ROOT, "public", "earth"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "public", "earth", "bathymetry.bin"), Buffer.from(eb.buffer));
  manifest.earth = { file: "/earth/bathymetry.bin", rows: EBR, cols: EBC, bounds: grid.bounds, dtype: "int16" };
}

fs.writeFileSync(path.join(PUB, "manifest.json"), JSON.stringify(manifest, null, 2));
fs.mkdirSync(path.join(ROOT, "src", "lib"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "src", "lib", "baked.json"), JSON.stringify(baked, null, 2));
console.log("\nWrote public/scenarios/*.bin + manifest.json + src/lib/baked.json");
