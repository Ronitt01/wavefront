import { PNG } from "../node_modules/pngjs/lib/png.js";
// A tile over the deep Pacific: zoom 2, x=0 (lon -180..-90), y=1 (mid-north).
const url = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/2/0/1.png";
const res = await fetch(url);
console.log("HTTP", res.status, res.headers.get("content-type"));
if (!res.ok) process.exit(1);
const buf = Buffer.from(await res.arrayBuffer());
const png = PNG.sync.read(buf);
console.log("size", png.width, "x", png.height);
let min = Infinity, max = -Infinity, ocean = 0, n = 0;
for (let i = 0; i < png.data.length; i += 4) {
  const r = png.data[i], g = png.data[i + 1], b = png.data[i + 2];
  const elev = r * 256 + g + b / 256 - 32768; // terrarium decode -> meters
  if (elev < min) min = elev; if (elev > max) max = elev;
  if (elev < 0) ocean++; n++;
}
console.log("elev range (m):", min.toFixed(0), "to", max.toFixed(0));
console.log("ocean fraction:", (100 * ocean / n).toFixed(1) + "%  (expect majority for a Pacific tile)");
