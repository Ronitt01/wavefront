"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Anchor, MousePointerClick, Timer } from "lucide-react";

type Step = {
  n: string;
  title: string;
  body: string;
  meta: string;
  icon: React.ComponentType<{ className?: string }>;
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "Pick a tsunami",
    body: "Choose one of history's deadliest waves — from Tōhoku 2011 to Chile 1960, the largest quake ever recorded.",
    meta: "5 scenarios · every ocean basin",
    icon: MousePointerClick,
  },
  {
    n: "02",
    title: "Scroll to release the wave",
    body: "The front crosses real ocean depth at c = √(g·depth) — ~800 km/h over deep basins, slowing over shelves, bending around islands.",
    meta: "Eikonal solver · live bathymetry",
    icon: Anchor,
  },
  {
    n: "03",
    title: "See your arrival window",
    body: "A countdown lands on the modeled arrival time at the coast, with calm, concrete guidance on what to do.",
    meta: "Deterministic · never invented",
    icon: Timer,
  },
];

export function HowItWorks() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="how-it-works-title"
      className="relative overflow-hidden bg-abyss py-24 sm:py-32"
    >
      {/* faint cyan horizon glow, continuous with the globe hero above */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-64 max-w-4xl rounded-full bg-iso/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="max-w-2xl">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="font-mono text-xs uppercase tracking-[0.25em] text-iso text-glow-iso"
          >
            How it works
          </motion.p>
          <motion.h2
            id="how-it-works-title"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mt-4 font-display text-3xl font-medium tracking-tight text-ink text-balance sm:text-4xl"
          >
            From a historic quake to your coast — in three scrolls.
          </motion.h2>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-4 text-base leading-relaxed text-muted text-pretty"
          >
            No login, no setup. Just a luminous wavefront sweeping the real ocean,
            and a clear answer to the only question that matters: when would it reach
            the coast?
          </motion.p>
        </div>

        {/* Steps */}
        <ol className="mt-14 grid gap-5 sm:mt-16 md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === STEPS.length - 1;
            return (
              <motion.li
                key={step.n}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: 0.08 * i }}
                className="group relative flex flex-col rounded-2xl border border-line bg-surface/60 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-iso/30 hover:bg-surface-2/70"
              >
                {/* top row: index + icon */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm tabular-nums text-faint transition-colors duration-300 group-hover:text-iso">
                    {step.n}
                  </span>
                  <span className="flex size-10 items-center justify-center rounded-xl border border-line bg-abyss/60 text-iso transition-colors duration-300 group-hover:border-iso/40">
                    <Icon className="size-5" aria-hidden />
                  </span>
                </div>

                <h3 className="mt-6 font-display text-lg font-medium tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">
                  {step.body}
                </p>

                {/* meta label */}
                <div className="mt-5 flex items-center gap-2 pt-4 border-t border-line/60">
                  <span
                    aria-hidden
                    className="inline-block size-1.5 rounded-full bg-iso shadow-[0_0_8px_rgba(62,233,255,0.7)]"
                  />
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-faint">
                    {step.meta}
                  </span>
                </div>

                {/* connector arrow between cards (md+ only) */}
                {!isLast && (
                  <span
                    aria-hidden
                    className="absolute top-1/2 right-0 z-10 hidden -translate-y-1/2 translate-x-1/2 text-faint md:block"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </span>
                )}
              </motion.li>
            );
          })}
        </ol>

        {/* Reassurance / disclaimer footnote */}
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10 max-w-3xl text-xs leading-relaxed text-faint text-pretty"
        >
          Every number is computed deterministically from real bathymetry — never
          invented by an AI. Wavefront is an educational preparedness visualization,
          not a real-time warning system.
        </motion.p>
      </div>
    </section>
  );
}
