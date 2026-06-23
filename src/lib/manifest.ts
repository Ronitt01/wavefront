import * as THREE from "three";

/** Mirrors public/scenarios/manifest.json emitted by scripts/bake.mjs. */
export interface Bounds {
  latMax: number;
  latMin: number;
  lonMin: number;
  lonMax: number;
}

export interface ScenarioField {
  id: string;
  file: string;
  epicenter: { lat: number; lon: number };
  epicenterCell: { lat: number; lon: number };
  coast: {
    label: string;
    lat: number;
    lon: number;
    arrivalMinutes: number;
    distanceKm: number;
  };
  maxMinutes: number;
}

export interface Manifest {
  fieldRows: number;
  fieldCols: number;
  bounds: Bounds;
  scenarios: ScenarioField[];
  earth: { file: string; rows: number; cols: number; bounds: Bounds; dtype: string };
}

export async function loadManifest(): Promise<Manifest> {
  const res = await fetch("/scenarios/manifest.json");
  if (!res.ok) throw new Error(`manifest ${res.status}`);
  return res.json();
}

/**
 * Fetch a baked travel-time field (.bin Float32, minutes; -1 = land/unreached)
 * into a single-channel float DataTexture the globe shader samples.
 */
export async function loadFieldTexture(
  file: string,
  rows: number,
  cols: number,
): Promise<THREE.DataTexture> {
  const res = await fetch(file);
  if (!res.ok) throw new Error(`field ${file} ${res.status}`);
  const data = new Float32Array(await res.arrayBuffer());
  if (data.length !== rows * cols) {
    throw new Error(`field size ${data.length} != ${rows * cols}`);
  }
  const tex = new THREE.DataTexture(data, cols, rows, THREE.RedFormat, THREE.FloatType);
  tex.flipY = false; // row 0 = north (latMax)
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.wrapS = THREE.RepeatWrapping; // longitude wraps
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

/** lat/lon (degrees) -> unit position on a globe of radius 1 (lon 0 -> +X). */
export function latLonToVec3(lat: number, lon: number, radius = 1): THREE.Vector3 {
  const latR = (lat * Math.PI) / 180;
  const lonR = (lon * Math.PI) / 180;
  return new THREE.Vector3(
    radius * Math.cos(latR) * Math.cos(lonR),
    radius * Math.sin(latR),
    radius * Math.cos(latR) * Math.sin(lonR),
  );
}
