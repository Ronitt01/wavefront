import type { Scenario, ScenarioId } from "@/lib/types";

/**
 * History's deadliest tsunamis, spanning every major ocean basin so the engine
 * demonstrably works worldwide (Pacific N & S, Indian, Atlantic, Mediterranean).
 *
 * Epicenter coordinates and magnitudes are seeded from authoritative sources and
 * verified by the data-sourcing pass; `featuredCoast.arrivalMinutes` and
 * `distanceKm` are computed offline by scripts/bake.mjs from real GEBCO/ETOPO
 * bathymetry (null until baked — never hallucinated at runtime).
 */
export const SCENARIOS: Scenario[] = [
  {
    id: "tohoku-2011",
    name: "Tōhoku",
    country: "Japan",
    year: "2011",
    ocean: "Pacific Ocean",
    epicenter: { lat: 38.297, lon: 142.373 },
    magnitude: 9.1,
    tollNote: "~18,500 lives lost",
    blurb:
      "A megathrust off northeast Japan drove walls of water over seawalls within tens of minutes and triggered the Fukushima disaster.",
    source: "USGS ComCat official2011031405464630",
    featuredCoast: {
      label: "Sendai coast, Japan",
      lat: 38.26,
      lon: 141.04,
      arrivalMinutes: null,
      distanceKm: null,
    },
  },
  {
    id: "sumatra-2004",
    name: "Sumatra–Andaman",
    country: "Indonesia",
    year: "2004",
    ocean: "Indian Ocean",
    epicenter: { lat: 3.295, lon: 95.982 },
    magnitude: 9.1,
    tollNote: "~227,000 lives lost across 14 countries",
    blurb:
      "The deadliest tsunami in recorded history. With no Indian Ocean warning system, waves reached coasts from Aceh to Africa.",
    source: "USGS ComCat official20041226005853450",
    featuredCoast: {
      label: "Banda Aceh, Indonesia",
      lat: 5.55,
      lon: 95.32,
      arrivalMinutes: null,
      distanceKm: null,
    },
  },
  {
    id: "chile-1960",
    name: "Valdivia",
    country: "Chile",
    year: "1960",
    ocean: "South Pacific",
    epicenter: { lat: -38.143, lon: -73.407 },
    magnitude: 9.5,
    tollNote: "largest earthquake ever recorded",
    blurb:
      "The most powerful quake ever measured sent a tsunami across the entire Pacific — devastating Hilo, Hawai‘i ~15 hours later and reaching Japan a day on.",
    source: "USGS — Mw 9.5, 22 May 1960",
    featuredCoast: {
      label: "Hilo, Hawai‘i",
      lat: 19.73,
      lon: -155.09,
      arrivalMinutes: null,
      distanceKm: null,
    },
  },
  {
    id: "lisbon-1755",
    name: "Lisbon",
    country: "Portugal",
    year: "1755",
    ocean: "Atlantic Ocean",
    epicenter: { lat: 36.0, lon: -10.5 },
    magnitude: 8.5,
    tollNote: "tens of thousands lost",
    blurb:
      "The Great Lisbon earthquake's tsunami swept the Portuguese coast within minutes and struck Morocco and the Caribbean — reshaping European thought.",
    source: "Historical estimate (Iberia–Morocco margin), Mw ≈ 8.5–9.0",
    featuredCoast: {
      label: "Lisbon, Portugal",
      lat: 38.71,
      lon: -9.14,
      arrivalMinutes: null,
      distanceKm: null,
    },
  },
  {
    id: "crete-365",
    name: "Crete",
    country: "Eastern Mediterranean",
    year: "365 AD",
    ocean: "Mediterranean Sea",
    epicenter: { lat: 35.0, lon: 23.0 },
    magnitude: 8.3,
    tollNote: "thousands lost; Alexandria devastated",
    blurb:
      "An undersea quake off Crete launched a tsunami across the eastern Mediterranean, drowning Alexandria — its anniversary still marked centuries later.",
    source: "Historical estimate (Hellenic Arc), Mw ≈ 8.3–8.5",
    featuredCoast: {
      label: "Alexandria, Egypt",
      lat: 31.2,
      lon: 29.92,
      arrivalMinutes: null,
      distanceKm: null,
    },
  },
];

const BY_ID = new Map<ScenarioId, Scenario>(SCENARIOS.map((s) => [s.id, s]));

export function getScenario(id: ScenarioId): Scenario | undefined {
  return BY_ID.get(id);
}

export const DEFAULT_SCENARIO_ID: ScenarioId = "tohoku-2011";
