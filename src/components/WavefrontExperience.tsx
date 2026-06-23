"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CanvasMount from "@/components/CanvasMount";
import { SCENARIOS, DEFAULT_SCENARIO_ID } from "@/lib/scenarios";
import type { ScenarioId } from "@/lib/types";
import baked from "@/lib/baked.json";
import {
  ACTS,
  crossingT,
  hasLanded,
  onExperienceProgress,
  setExperienceProgress,
} from "@/lib/experience";
import { onScrollProgress } from "@/lib/scroll";
import type { BriefOutput } from "@/lib/brief-schema";

type Baked = Record<string, { arrivalMinutes: number; distanceKm: number }>;
const BAKED = baked as Baked;

function fmtElapsed(min: number): string {
  const m = Math.round(min);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}

export function WavefrontExperience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scenarioId, setScenarioId] = useState<ScenarioId>(DEFAULT_SCENARIO_ID);
  const [progress, setProgress] = useState(0);
  const [brief, setBrief] = useState<BriefOutput | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const arrival = BAKED[scenarioId]?.arrivalMinutes ?? 0;
  const distance = BAKED[scenarioId]?.distanceKm ?? 0;

  // Map page scroll -> local experience progress (0..1 across this section).
  useEffect(() => {
    const measure = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const p = span > 0 ? -rect.top / span : 0;
      setExperienceProgress(p);
    };
    const off = onScrollProgress(measure);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => {
      off();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Mirror the store into React state for the HUD.
  useEffect(() => onExperienceProgress(setProgress), []);

  // Reset + fetch the brief once the wave lands.
  useEffect(() => {
    setBrief(null);
  }, [scenarioId]);

  useEffect(() => {
    if (!hasLanded(progress) || brief || briefLoading) return;
    setBriefLoading(true);
    fetch("/api/brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenarioId,
        coastLabel: scenario.featuredCoast.label,
        arrivalMinutes: arrival,
        distanceKm: distance,
        magnitude: scenario.magnitude,
      }),
    })
      .then((r) => r.json())
      .then((d: BriefOutput) => setBrief(d))
      .catch(() => {})
      .finally(() => setBriefLoading(false));
  }, [progress, brief, briefLoading, scenarioId, scenario, arrival, distance]);

  const ct = crossingT(progress);
  const elapsedMin = ct * arrival;
  const landed = hasLanded(progress);
  const started = progress > ACTS.introEnd * 0.5;

  return (
    <section ref={sectionRef} className="relative h-[600vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* 3D */}
        <div className="absolute inset-0">
          <CanvasMount scenarioId={scenarioId} />
        </div>

        {/* vignette for legibility */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(3,6,13,0.75)_100%)]" />

        {/* Title (fades out as the wave starts) */}
        <AnimatePresence>
          {!started && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6 }}
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
            >
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-iso/80">
                Preparedness visualization
              </p>
              <h1 className="mt-3 font-display text-6xl font-semibold tracking-tight sm:text-8xl">
                Wavefront
              </h1>
              <p className="mt-4 max-w-xl text-balance text-base text-muted sm:text-lg">
                See how fast a tsunami crosses an ocean — and why your first
                minutes decide everything.
              </p>
              <div className="mt-10 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-faint">
                <span>Scroll to release the wave</span>
                <motion.span
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                >
                  ↓
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD */}
        {started && (
          <>
            {/* event identity */}
            <div className="absolute left-6 top-6 sm:left-10 sm:top-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-iso">
                {scenario.ocean}
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
                {scenario.name}, {scenario.year}
              </h2>
              <p className="mt-1 font-mono text-xs text-muted">
                Mw {scenario.magnitude.toFixed(1)} · {scenario.tollNote}
              </p>
            </div>

            {/* countdown */}
            <div className="absolute bottom-28 left-6 sm:bottom-24 sm:left-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-faint">
                Modeled time since the quake
              </p>
              <div className="mt-1 flex items-end gap-3">
                <span className="font-mono text-5xl font-semibold tabular-nums text-iso text-glow-iso sm:text-7xl">
                  {fmtElapsed(elapsedMin)}
                </span>
              </div>
              <p className="mt-2 max-w-xs font-mono text-xs text-muted">
                wave traveling {distance.toLocaleString()} km of open ocean
              </p>
            </div>
          </>
        )}

        {/* Landfall brief */}
        <AnimatePresence>
          {landed && (
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.6 }}
              className="absolute bottom-24 right-6 max-w-sm rounded-2xl border border-line bg-surface/70 p-5 backdrop-blur-md sm:right-10"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-danger">
                Wave reaches {scenario.featuredCoast.label}
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-ink">
                {fmtElapsed(arrival)} after the quake
              </p>
              {brief ? (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {brief.briefing}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {brief.doNow.map((d, i) => (
                      <li key={i} className="flex gap-2 text-sm text-ink">
                        <span className="text-safe">→</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-3 text-sm text-faint">Preparing briefing…</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scenario picker */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-wrap justify-center gap-2 px-4">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setScenarioId(s.id)}
              className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition ${
                s.id === scenarioId
                  ? "border-iso/60 bg-iso/15 text-iso"
                  : "border-line bg-surface/40 text-muted hover:text-ink"
              }`}
            >
              {s.name} {s.year}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
