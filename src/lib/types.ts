/** Core domain types for Wavefront. */

export type ScenarioId =
  | "tohoku-2011"
  | "sumatra-2004"
  | "chile-1960"
  | "lisbon-1755"
  | "crete-365";

export interface LatLon {
  lat: number;
  lon: number;
}

/** A coastline we "dive" to and compute a personal arrival number for. */
export interface ScenarioCoast {
  label: string;
  lat: number;
  lon: number;
  /** Filled by the offline baker (scripts/bake.mjs) from real bathymetry. */
  arrivalMinutes: number | null;
  distanceKm: number | null;
}

export interface Scenario {
  id: ScenarioId;
  /** Event name, e.g. "Tōhoku". */
  name: string;
  country: string;
  year: string;
  ocean: string;
  epicenter: LatLon;
  /** Moment magnitude (Mw). */
  magnitude: number;
  /** Human toll, for sober historical context. */
  tollNote: string;
  /** One-line historical framing. */
  blurb: string;
  /** Source citation for the epicenter / magnitude. */
  source: string;
  /** The coast the scenario dives to. */
  featuredCoast: ScenarioCoast;
}

/** Result of the deterministic engine, passed to the AI brief route. */
export interface ComputedBrief {
  scenarioId: ScenarioId;
  coastLabel: string;
  arrivalMinutes: number;
  distanceKm: number;
  magnitude: number;
}
