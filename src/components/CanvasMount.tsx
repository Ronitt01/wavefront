"use client";

import dynamic from "next/dynamic";

// The 3D canvas touches window/WebGL, so load it client-only.
const WavefrontCanvas = dynamic(
  () => import("./r3f/WavefrontCanvas").then((m) => m.WavefrontCanvas),
  { ssr: false },
);

export default function CanvasMount({ scenarioId }: { scenarioId?: string }) {
  return <WavefrontCanvas scenarioId={scenarioId} />;
}
