# 🌊 Wavefront

**See how fast a tsunami crosses an ocean — and why your first minutes decide everything.**

A no-login, cinematic preparedness visualization. Pick one of history's deadliest tsunamis, scroll, and watch a luminous wavefront sweep across the **real ocean** from the epicenter to a coast — while a countdown lands on the modeled arrival time and tells you what to do.

> Day 9 of *10 web apps in 10 days*.

---

## Why it's not a toy

The wavefront is **real physics, not animation**. Tsunamis travel at `c = √(g · depth)` — ~800 km/h over deep basins, slowing over continental shelves. Wavefront computes this as a **true front** with a Fast Marching (Eikonal) solver over real global bathymetry, so the wave **refracts around islands and casts genuine shadow zones** — never a naive expanding circle.

**Validated against documented history:**

| Event | Modeled arrival | Recorded |
|---|---|---|
| Chile 1960 → Hilo, Hawai‘i | **14.9 h** | ~15 h |
| Lisbon 1755 → Lisbon | **40 min** | ~40 min |

Every number is **computed deterministically** and injected into the UI. An LLM only phrases the plain-language safety brief — it never produces a time, distance, or citation. (No API key? A deterministic fallback brief keeps it fully working and honest.)

## How it works

1. **Pick** a historic quake (Tōhoku 2011, Sumatra 2004, Chile 1960, Lisbon 1755, Crete 365 AD — every ocean basin).
2. **Scroll** — the isochrone wavefront crosses real ocean depth as the camera glides from epicenter to coast.
3. **Arrive** — the countdown lands on the modeled time the wave reaches the coast, with calm, concrete guidance.

## Stack

- **Next.js 16** (App Router) · TypeScript · Tailwind v4
- **React Three Fiber** + drei + postprocessing — photoreal globe, day/night, isochrone shader, bloom
- **Lenis** smooth-scroll driving a single scroll timeline
- **Gemini 2.5 Flash** (server route, Zod-validated) for the brief — with a deterministic fallback
- Deployed on **Vercel**

## Data

- Ocean depth: **AWS Terrain Tiles** (public terrarium tiles) → reprojected to an equirectangular grid
- Earth imagery: **NASA Blue Marble** & **Earth at Night** (public domain)
- Epicenters: **USGS** (Lisbon/Crete are cited historical estimates)

The travel-time fields are precomputed offline:

```bash
npm install
node scripts/fetch-bathymetry.mjs 4   # pull + reproject global bathymetry
node scripts/bake.mjs                  # solve the Eikonal field per scenario
npm run dev
```

## ⚠️ Disclaimer

Wavefront is an **educational preparedness visualization, not a real-time warning system**. In a real event: if you feel a strong or long earthquake near the coast, **move to high ground immediately — do not wait for an alert.**

---

Built by Ronit.
