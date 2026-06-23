# Wavefront — Handoff

> Day 9 of *10 web apps in 10 days*. A no-login, scroll-driven 3D visualization of how fast a
> tsunami crosses an ocean, grounded in real physics. **Educational — not a warning system.**

---

## Status

| Area | State |
|---|---|
| 3D hero (globe + isochrone wavefront + scroll choreography + countdown HUD + brief) | ✅ Done, browser-verified |
| Eikonal travel-time engine (offline baker) | ✅ Done, **validated** vs history (Chile 1960 → Hilo 14.9h vs ~15h; Lisbon 1755 ~40min) |
| Landing page (7 sections, shadcn/magicui) | ✅ Done |
| `/api/brief` (Gemini 2.5 Flash + deterministic fallback) | ✅ Done (fallback active until `GEMINI_API_KEY` set) |
| Mobile responsive · dark theme · production build | ✅ Verified (`npm run build` green) |
| Repo | ✅ `github.com/Ronitt01/wavefront` (`main`) |
| Vercel | ⏳ Import repo on vercel.com → Deploy (auto-detects Next.js, no env required) |

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind v4 · React Three Fiber + drei + @react-three/postprocessing ·
Lenis (smooth scroll) · framer-motion · Zod · shadcn/ui + magicui · Gemini 2.5 Flash (server route).

## How it works (the moat)

A tsunami's speed is `c = √(g · depth)`. The **offline baker** runs a **Fast Marching (Eikonal) solver** over a real
global bathymetry grid, producing a per-scenario travel-time field. The globe shader draws the isochrone where
`field ≈ scrollMinutes`, so the front **decelerates over shelves and refracts around islands** — a true front, not a
circle. Every number shown is **computed**, never AI-generated (the LLM only phrases the safety brief).

## Rebuild the data (only needed if changing scenarios/resolution)

```bash
npm install
node scripts/fetch-bathymetry.mjs 4   # pull AWS Terrain Tiles → equirectangular Int16 grid (scripts/data/)
node scripts/bake.mjs                  # Eikonal solve per scenario → public/scenarios/*.bin + manifest + src/lib/baked.json
npm run dev                            # http://localhost:3000
node --test scripts/eikonal.test.mjs   # physics unit tests
```

Scenarios are defined in `scripts/scenarios.epicenters.json` (baker input) + `src/lib/scenarios.ts` (display copy).

## Key files

```
scripts/
  lib/eikonal.mjs        Fast Marching solver (the moat)         + eikonal.test.mjs
  lib/grid.mjs, geo.mjs  bathymetry grid loader + geodesy/physics
  fetch-bathymetry.mjs   global bathymetry fetch + reproject
  bake.mjs               per-scenario travel-time bake
src/
  lib/experience.ts      scroll→acts timeline (intro/crossing/landfall)
  lib/scroll.ts          Lenis progress store
  lib/manifest.ts        loads baked fields → DataTexture
  lib/scenarios.ts, baked.json   scenario data + computed arrivals
  components/WavefrontExperience.tsx   scrollytelling shell, HUD, picker, brief reveal
  components/r3f/Globe.tsx             globe + day/night + isochrone shader + camera director
  components/r3f/WavefrontCanvas.tsx   Canvas + Stars + Bloom
  components/landing/*                 7 marketing sections
  app/api/brief/route.ts               Gemini brief + deterministic fallback
public/
  scenarios/*.bin, manifest.json   baked travel-time fields
  earth/day.jpg, night.jpg, bathymetry.bin   globe textures
  hdr/space_2k.hdr                  (available; not yet wired as env light)
```

## Known limitations (honest)

- **Curated scenarios only** — 5 historic events, not arbitrary coasts yet (v2 below).
- **Basin-scale resolution** — bathymetry is ~0.17°; great for ocean-crossing isochrones, coarse at the immediate shoreline.
- **No onshore layer yet** — the planned camera-dive to the coast with inundation + evacuation direction is not built.
- **Time, not height** — by design: there is no wave-amplitude data, so the ring is strictly an arrival-time contour.
- A few non-blocking lint warnings in vendored magicui (`particles.tsx`) and the hero effect.

---

## Future features (roadmap)

### Tier 1 — the obvious next leaps
1. **Arbitrary global pin (v2).** Drop a pin on *any* coast → live regional DEM fetch + a web-worker Eikonal/Dijkstra
   solve → instant personal "your wave in X minutes." This is the headline upgrade that turns 5 scenarios into "any coast on Earth."
2. **Onshore landfall scene.** The camera-dive to the coast: extrude regional terrain, flood the lowlands to run-up height
   (red), flood-fill safe high ground (green), and draw a glowing **least-cost evacuation path** (slope-penalized Tobler).
   The "go this way, you have N minutes" frame is the most shareable, most useful moment.
3. **Share / OG card generation.** Capture the dive frame (or the globe + countdown) into a 1200×630 image via
   `next/og` or canvas → shareable links with per-scenario OG previews.

### Tier 2 — depth & trust
4. **Relative wave intensity (honest).** Layer Green's law (`amplitude ∝ depth^(-1/4)`) + geometric spreading to modulate
   ring brightness/opacity — clearly labeled *relative energy, not absolute height*. Keeps the time-honesty, adds nuance.
5. **Higher-res near-shore bathymetry.** Patch in GEBCO 15-arc-second tiles around each featured coast for accurate
   shelf deceleration and arrival times.
6. **"Build your own quake."** Let users set epicenter + magnitude and watch the resulting wavefront — a sandbox.
7. **More scenarios.** Alaska 1964, Cascadia 1700, Tonga 2022 (volcanic), Storegga; group by ocean.

### Tier 3 — reach & polish
8. **Live recent-quakes mode.** Pull the USGS feed to show recent significant offshore quakes (clearly still educational,
   with a hard "follow official alerts" gate) — a reason to return.
9. **Localization + units.** Metric/imperial toggle and i18n (the pain is global; start with ES/JA/ID/HI).
10. **Sonification.** A subtle low rumble that rises as the front nears the coast; a tick on the countdown. Mute by default.
11. **Accessibility deepening.** Keyboard timeline scrubbing, screen-reader narration of wave progress, full reduced-motion path.
12. **Performance.** Lazy-load fields per scenario, globe LOD, and a graceful 2D-map fallback when WebGL is weak/absent.
13. **Wire the AI brief.** Add `GEMINI_API_KEY` in Vercel to enable AI-phrased briefings (numbers still injected, never generated).

---

*Built by Ronit. Disclaimer: Wavefront is an educational preparedness visualization, not a real-time warning system.
In a real event, if you feel a strong or long earthquake near the coast, move to high ground immediately — don't wait for an alert.*
