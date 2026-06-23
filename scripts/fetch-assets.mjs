// Download globe surface textures (NASA, public domain) + a space HDRI
// (Poly Haven, CC0). All URLs verified reachable by the data-sourcing pass.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const ASSETS = [
  // NASA Blue Marble — day, topo + bathymetry color, 5400x2700 (~2.6MB)
  [
    "https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg",
    "public/earth/day.jpg",
  ],
  // NASA Earth's City Lights — night, 2400x1200 (~0.55MB)
  [
    "https://eoimages.gsfc.nasa.gov/images/imagerecords/55000/55167/earth_lights_lrg.jpg",
    "public/earth/night.jpg",
  ],
  // Poly Haven dikhololo_night — clear starry sky HDRI, 2k (~7MB), CC0
  [
    "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/dikhololo_night_2k.hdr",
    "public/hdr/space_2k.hdr",
  ],
];

async function download(url, rel) {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(out, buf);
  console.log(`OK  ${rel}  (${(buf.length / 1e6).toFixed(2)} MB)`);
}

let ok = 0;
for (const [url, rel] of ASSETS) {
  try {
    await download(url, rel);
    ok++;
  } catch (e) {
    console.error(`FAIL ${rel}: ${e.message}`);
  }
}
console.log(`\n${ok}/${ASSETS.length} assets downloaded`);
