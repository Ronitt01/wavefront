"use client";

import { motion, useReducedMotion, type MotionProps } from "framer-motion";
import { Waves, Activity, ArrowRight } from "lucide-react";
import { SCENARIOS } from "@/lib/scenarios";
import baked from "@/lib/baked.json";

type Baked = Record<string, { arrivalMinutes: number; distanceKm: number }>;
const BAKED = baked as Baked;

/** Format modeled travel time as a compact "min" / "h m" string. */
function fmtArrival(min: number): string {
  const m = Math.round(min);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}

/** Distinct ocean basins covered, for the "every basin" claim. */
const BASINS = Array.from(new Set(SCENARIOS.map((s) => s.ocean)));

export function Scenarios() {
  const reduce = useReducedMotion();

  const reveal = (i: number): MotionProps =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: {
            duration: 0.6,
            delay: i * 0.07,
            ease: [0.16, 1, 0.3, 1],
          },
        };

  return (
    <section
      aria-labelledby="scenarios-heading"
      className="relative overflow-hidden bg-abyss py-24 sm:py-32"
    >
      {/* faint top hairline to read continuous with the hero above */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-iso/20 to-transparent" />
      {/* soft cyan wash anchored top-center */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-iso/5 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-iso">
            Validated scenarios
          </p>
          <h2
            id="scenarios-heading"
            className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl"
          >
            History&rsquo;s deadliest waves, modeled across every ocean.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            Five megathrust catastrophes from the Pacific, Indian, Atlantic and
            Mediterranean. Each arrival time below is computed deterministically
            from real ocean-depth data &mdash; never invented.
          </p>
        </div>

        {/* Basin coverage strip */}
        <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3">
          <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
            {BASINS.length} basins
          </span>
          {BASINS.map((basin) => (
            <span
              key={basin}
              className="rounded-full border border-line bg-surface/50 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted"
            >
              {basin}
            </span>
          ))}
        </div>

        {/* Card grid */}
        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SCENARIOS.map((s, i) => {
            const arrival = BAKED[s.id]?.arrivalMinutes ?? null;
            const distance = BAKED[s.id]?.distanceKm ?? null;
            return (
              <motion.li
                key={s.id}
                {...reveal(i)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface/40 p-6 transition-colors duration-300 hover:border-iso/30 focus-within:border-iso/30"
              >
                {/* hover glow */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-iso/0 blur-3xl transition-colors duration-500 group-hover:bg-iso/10" />

                {/* Eyebrow: ocean + magnitude */}
                <div className="relative flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-iso">
                    <Waves className="h-3.5 w-3.5" aria-hidden="true" />
                    {s.ocean}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-gold">
                    <Activity className="h-3.5 w-3.5" aria-hidden="true" />
                    Mw {s.magnitude.toFixed(1)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="relative mt-4 font-display text-2xl font-semibold tracking-tight text-ink">
                  {s.name}
                  <span className="ml-2 font-mono text-base font-normal text-faint tabular-nums">
                    {s.year}
                  </span>
                </h3>
                <p className="relative mt-0.5 font-mono text-xs uppercase tracking-wider text-faint">
                  {s.country}
                </p>

                {/* Blurb */}
                <p className="relative mt-4 flex-1 text-sm leading-relaxed text-muted">
                  {s.blurb}
                </p>

                {/* Modeled arrival readout */}
                <div className="relative mt-6 border-t border-line pt-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                    Modeled arrival
                  </p>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-semibold tabular-nums text-iso text-glow-iso">
                      {arrival !== null ? fmtArrival(arrival) : "—"}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-faint"
                      aria-hidden="true"
                    />
                    <span className="text-sm leading-tight text-ink">
                      {s.featuredCoast.label}
                    </span>
                  </div>
                  {distance !== null && (
                    <p className="mt-2 font-mono text-[11px] text-faint">
                      across {distance.toLocaleString()} km of open ocean
                    </p>
                  )}
                </div>
              </motion.li>
            );
          })}

          {/* Closing breadth tile */}
          <motion.li
            {...reveal(SCENARIOS.length)}
            className="relative flex flex-col justify-center overflow-hidden rounded-2xl border border-iso/20 bg-gradient-to-br from-surface-2/60 to-surface/30 p-6"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(62,233,255,0.08),transparent_60%)]" />
            <p className="relative font-mono text-[11px] uppercase tracking-[0.25em] text-iso">
              One engine, any coast
            </p>
            <p className="relative mt-3 font-display text-2xl font-semibold leading-snug tracking-tight text-ink">
              From a 40-minute Atlantic strike to a 15-hour Pacific crossing.
            </p>
            <p className="relative mt-3 text-sm leading-relaxed text-muted">
              The same Fast Marching solver refracts each wavefront around real
              islands and shelves &mdash; the breadth here is the proof it
              generalizes to every shoreline on Earth.
            </p>
          </motion.li>
        </ul>

        {/* Disclaimer */}
        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-faint">
          Wavefront is an educational preparedness visualization, not a real-time
          warning system. In a real event: if you feel a strong or long
          earthquake near the coast, move to high ground immediately and do not
          wait for an official alert.
        </p>
      </div>
    </section>
  );
}
