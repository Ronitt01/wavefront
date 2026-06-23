"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, useTexture } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import {
  loadManifest,
  loadFieldTexture,
  latLonToVec3,
  type ScenarioField,
  type Bounds,
} from "@/lib/manifest";
import { Globe } from "./Globe";

function Scene({ scenarioId }: { scenarioId: string }) {
  const [data, setData] = useState<{
    entry: ScenarioField;
    field: THREE.DataTexture;
    bounds: Bounds;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const m = await loadManifest();
      const entry = m.scenarios.find((s) => s.id === scenarioId) ?? m.scenarios[0];
      const field = await loadFieldTexture(entry.file, m.fieldRows, m.fieldCols);
      if (cancelled) {
        field.dispose(); // superseded/unmounted before handoff — free the GPU texture
        return;
      }
      setData((prev) => {
        if (prev && prev.field !== field) prev.field.dispose(); // free the outgoing one
        return { entry, field, bounds: m.bounds };
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [scenarioId]);

  const [day, night] = useTexture(["/earth/day.jpg", "/earth/night.jpg"]);
  useMemo(() => {
    for (const t of [day, night]) {
      t.colorSpace = THREE.NoColorSpace; // shader linearizes manually
      t.anisotropy = 8;
      t.wrapS = THREE.RepeatWrapping;
    }
  }, [day, night]);

  const sunDir = useMemo(() => latLonToVec3(12, -30), []);

  if (!data) return null;
  return (
    <Globe
      entry={data.entry}
      fieldTexture={data.field}
      dayMap={day}
      nightMap={night}
      bounds={data.bounds}
      sunDir={sunDir}
    />
  );
}

export function WavefrontCanvas({ scenarioId = "chile-1960" }: { scenarioId?: string }) {
  const isMobile =
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  return (
    <Canvas
      camera={{ position: [0, 0.35, 3.0], fov: 42 }}
      gl={{ antialias: !isMobile, powerPreference: "high-performance" }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
    >
      <color attach="background" args={["#03060d"]} />
      <Suspense fallback={null}>
        <Scene scenarioId={scenarioId} />
        <Stars radius={300} depth={60} count={isMobile ? 3500 : 7000} factor={6} saturation={0} fade speed={0.6} />
      </Suspense>
      <EffectComposer>
        <Bloom intensity={0.9} luminanceThreshold={0.55} luminanceSmoothing={0.2} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
