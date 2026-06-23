// Loads the equirectangular bathymetry grid and exposes the geometry the
// Fast Marching solver needs (depth, latitude-aware cell spacing, lat/lon <-> r,c).

import fs from "node:fs";
import { R_EARTH_M, toRad } from "./geo.mjs";

export function loadGrid(binPath, metaPath, opts = {}) {
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  const buf = fs.readFileSync(binPath);
  let elev = new Int16Array(buf.buffer, buf.byteOffset, buf.byteLength / 2);
  let { rows, cols } = meta;
  const { latMax, latMin, lonMin, lonMax } = meta;

  // Optional integer block-average downsample (speeds up the solve).
  const ds = opts.downsample ?? 1;
  if (ds > 1) {
    const nr = Math.floor(rows / ds);
    const nc = Math.floor(cols / ds);
    const out = new Int16Array(nr * nc);
    for (let r = 0; r < nr; r++) {
      for (let c = 0; c < nc; c++) {
        let sum = 0;
        let n = 0;
        for (let dr = 0; dr < ds; dr++) {
          for (let dc = 0; dc < ds; dc++) {
            sum += elev[(r * ds + dr) * cols + (c * ds + dc)];
            n++;
          }
        }
        out[r * nc + c] = Math.round(sum / n);
      }
    }
    elev = out;
    rows = nr;
    cols = nc;
  }

  const dLatDeg = (latMax - latMin) / rows;
  const dLonDeg = (lonMax - lonMin) / cols;
  const dLonRad = toRad(dLonDeg);
  const dy = R_EARTH_M * toRad(dLatDeg);

  const latOfRow = (r) => latMax - (r + 0.5) * dLatDeg;
  const lonOfCol = (c) => lonMin + (c + 0.5) * dLonDeg;

  return {
    rows,
    cols,
    periodicX: true, // global longitude wrap
    dy,
    elev,
    bounds: { latMax, latMin, lonMin, lonMax },
    depthAt(r, c) {
      return -elev[r * cols + c]; // ocean depth (>0 ocean, <=0 land)
    },
    isOcean(r, c) {
      return elev[r * cols + c] < 0;
    },
    dxAt(r) {
      return R_EARTH_M * Math.cos(toRad(latOfRow(r))) * dLonRad;
    },
    latOfRow,
    lonOfCol,
    rcOf(lat, lon) {
      let r = Math.round((latMax - lat) / dLatDeg - 0.5);
      let c = Math.round((lon - lonMin) / dLonDeg - 0.5);
      r = Math.max(0, Math.min(rows - 1, r));
      c = ((c % cols) + cols) % cols;
      return [r, c];
    },
  };
}

/** Nearest ocean cell — epicenters/coasts can land on a coarse-grid land pixel. */
export function nearestOcean(grid, r, c, maxRadius = 40) {
  if (grid.isOcean(r, c)) return [r, c];
  const { rows, cols } = grid;
  for (let rad = 1; rad <= maxRadius; rad++) {
    for (let dr = -rad; dr <= rad; dr++) {
      for (let dc = -rad; dc <= rad; dc++) {
        if (Math.max(Math.abs(dr), Math.abs(dc)) !== rad) continue;
        const nr = r + dr;
        if (nr < 0 || nr >= rows) continue;
        const nc = ((c + dc) % cols + cols) % cols;
        if (grid.isOcean(nr, nc)) return [nr, nc];
      }
    }
  }
  return [r, c];
}
