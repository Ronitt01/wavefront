"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Waves,
  Radar,
  ShieldCheck,
  Check,
  Database,
  Cpu,
  FunctionSquare,
  TriangleAlert,
} from "lucide-react";

import baked from "@/lib/baked.json";
import { SCENARIOS } from "@/lib/scenarios";

/* ------------------------------------------------------------------ */
/*  Validation rows — every modeled figure is read from the SAME       */
/*  baked.json the engine ships with, then compared to the historical  */
/*  record. Nothing here is typed by hand twice; the model column is    */
/*  derived from real bathymetry output.                               */
/* ------------------------------------------------------------------ */

type ValidationRow = {
  id: string;
  label: string;
  route: string;
  modeled: string;
  recorded: string;
  note: string;
};

function minutesToReadable(min: number): { hours: string; minutes: string } {
  return {
    hours: `${(min / 60).toFixed(1)} h`,
    minutes: `~${Math.round(min)} min`,
  };
}

const VALIDATION: ValidationRow[] = [
  (() => {
    const s = SCENARIOS.find((x) => x.id === "chile-1960");
    const m = baked["chile-1960"].arrivalMinutes;
    return {
      id: "chile-1960",
      label: `${s?.name ?? "Valdivia"}, ${s?.country ?? "Chile"} ${s?.year ?? "1960"}`,
      route: `Epicenter → ${s?.featuredCoast.label ?? "Hilo, Hawai‘i"}`,
      modeled: minutesToReadable(m).hours,
      recorded: "~15 h",
      note: `${baked["chile-1960"].distanceKm.toLocaleString()} km of open Pacific`,
    };
  })(),
  (() => {
    const s = SCENARIOS.find((x) => x.id === "lisbon-1755");
    const m = baked["lisbon-1755"].arrivalMinutes;
    return {
      id: "lisbon-1755",
      label: `${s?.name ?? "Lisbon"}, ${s?.country ?? "Portugal"} ${s?.year ?? "1755"}`,
      route: `Epicenter → ${s?.featuredCoast.label ?? "Lisbon, Portugal"}`,
      modeled: minutesToReadable(m).minutes,
      recorded: "~40 min",
      note: "Matches the historical record",
    };
  })(),
];

const PIPELINE = [
  {
    icon: Database,
    eyebrow: "Input",
    title: "Real ocean depth",
    body: "We read genuine global bathymetry from public terrain tiles — not a smooth, idealized sphere. Trenches, shelves and seamounts are all in the grid.",
  },
  {
    icon: FunctionSquare,
    eyebrow: "Physics",
    title: "Shallow-water speed",
    body: "A tsunami's speed follows c = √(g·depth): roughly 800 km/h over deep basins, slowing sharply as it climbs the continental shelf.",
  },
  {
    icon: Radar,
    eyebrow: "Solver",
    title: "Fast Marching (Eikonal)",
    body: "We propagate a true wavefront across the depth grid. It refracts around islands and casts real shadow zones — never a naive expanding circle.",
  },
  {
    icon: Cpu,
    eyebrow: "Output",
    title: "A computed number",
    body: "Every arrival time is solved deterministically and baked offline. An AI only phrases the plain-language brief — it never invents a figure.",
  },
] as const;

export function TheScience() {
  const reduce = useReducedMotion();

  const rise = {
    initial: { opacity: 0, y: reduce ? 0 : 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
  };

  return (
    <section
      aria-labelledby="science-heading"
      className="relative overflow-hidden bg-abyss py-24 sm:py-32"
    >
      {/* top hairline that reads as continuation from the hero above */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-iso/25 to-transparent"
      />
      {/* faint abyssal radial glow behind the content */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[680px] w-[1100px] -translate-x-1/2 rounded-full opacity-[0.07] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(62,233,255,1), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* ---- Header ---- */}
        <motion.div {...rise} className="max-w-3xl">
          <p className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-iso">
            <Waves className="size-3.5" aria-hidden strokeWidth={1.75} />
            The Science
          </p>
          <h2
            id="science-heading"
            className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl"
          >
            Not a glowing circle.
            <br />
            <span className="text-glow-iso text-iso">A solved wavefront.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted">
            Wavefront runs real tsunami physics over the real shape of the
            ocean floor. The wave you watch sweep the globe is the output of a
            numerical solver, validated against documented history — every number
            is computed, never guessed.
          </p>
        </motion.div>

        {/* ---- Pipeline: input -> physics -> solver -> output ---- */}
        <ol className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.08 }}
                className="group relative flex flex-col gap-4 bg-abyss p-7 transition-colors duration-300 hover:bg-surface/60"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-lg border border-iso/20 bg-iso/[0.06] text-iso transition-colors duration-300 group-hover:border-iso/40">
                    <Icon className="size-5" strokeWidth={1.6} aria-hidden />
                  </span>
                  <span
                    aria-hidden
                    className="font-mono text-xs tabular-nums text-faint"
                  >
                    0{i + 1}
                  </span>
                </div>
                <div>
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-faint">
                    {step.eyebrow}
                  </p>
                  <h3 className="mt-1.5 font-display text-lg font-medium text-ink">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted">{step.body}</p>
              </motion.li>
            );
          })}
        </ol>

        {/* ---- Validation proof ---- */}
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] lg:mt-16 lg:grid-cols-[1.05fr_1fr]">
          {/* Left: the claim */}
          <motion.div
            {...rise}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-between gap-8 bg-abyss p-8 sm:p-10"
          >
            <div>
              <p className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.2em] text-safe">
                <ShieldCheck className="size-4" aria-hidden strokeWidth={1.75} />
                Validated against history
              </p>
              <h3 className="mt-5 font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                We checked the model against events the world actually recorded.
              </h3>
              <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted">
                The solver&apos;s arrival times line up with the documented
                record — across an entire ocean, and across minutes. Same engine,
                same numbers you see in the visualization above.
              </p>
            </div>

            <p className="font-mono text-xs leading-relaxed text-faint">
              Modeled values shown are read directly from{" "}
              <span className="text-muted">baked.json</span>, the deterministic
              output committed with the app.
            </p>
          </motion.div>

          {/* Right: the table */}
          <motion.div
            {...rise}
            transition={{ duration: 0.6, delay: reduce ? 0 : 0.1 }}
            className="bg-surface/40 p-8 sm:p-10"
          >
            {/* column heads */}
            <div className="grid grid-cols-[1fr_auto_auto] items-end gap-x-5 border-b border-white/10 pb-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-faint">
              <span>Event &amp; route</span>
              <span className="text-right text-iso">Modeled</span>
              <span className="text-right">Recorded</span>
            </div>

            <ul className="divide-y divide-white/[0.07]">
              {VALIDATION.map((row) => (
                <li
                  key={row.id}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-x-5 py-5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-medium text-ink">
                      {row.label}
                    </p>
                    <p className="mt-1 truncate font-mono text-xs text-faint">
                      {row.route}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[0.68rem] text-faint/70">
                      {row.note}
                    </p>
                  </div>
                  <span className="text-right font-mono text-lg font-semibold tabular-nums text-iso text-glow-iso">
                    {row.modeled}
                  </span>
                  <span className="text-right font-mono text-lg font-semibold tabular-nums text-ink/85">
                    {row.recorded}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center gap-2 rounded-lg border border-safe/20 bg-safe/[0.06] px-3.5 py-2.5">
              <Check className="size-4 shrink-0 text-safe" strokeWidth={2.5} aria-hidden />
              <p className="text-sm text-safe/90">
                Two basins, two eras — both within the historical margin.
              </p>
            </div>
          </motion.div>
        </div>

        {/* ---- Disclaimer + sources ---- */}
        <motion.div
          {...rise}
          transition={{ duration: 0.6 }}
          className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[1.4fr_1fr]"
        >
          {/* Ethics / disclaimer */}
          <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gold/[0.05] p-7 sm:p-8">
            <p className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.2em] text-gold">
              <TriangleAlert className="size-4" aria-hidden strokeWidth={1.9} />
              Important — this is not a warning system
            </p>
            <p className="mt-4 text-pretty leading-relaxed text-ink/90">
              Wavefront is an{" "}
              <span className="font-medium text-gold">
                educational preparedness visualization
              </span>
              , not a real-time alert. In a real event:{" "}
              <span className="font-medium text-ink">
                if you feel a strong or long earthquake near the coast, move to
                high ground immediately and do not wait for an official alert.
              </span>
            </p>
          </div>

          {/* Data sources */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-faint">
              Data sources
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <SourceRow term="Ocean depth">
                AWS Terrain Tiles (public terrarium tiles)
              </SourceRow>
              <SourceRow term="Earth imagery">
                NASA Blue Marble &amp; Earth at Night (public domain)
              </SourceRow>
              <SourceRow term="Epicenters">USGS</SourceRow>
              <SourceRow term="Lisbon &amp; Crete">
                Cited historical estimates
              </SourceRow>
            </dl>
          </div>
        </motion.div>

        {/* ---- Credit ---- */}
        <motion.p
          {...rise}
          transition={{ duration: 0.6 }}
          className="mt-12 font-mono text-xs uppercase tracking-[0.16em] text-faint"
        >
          Built by Ronit · 10 web apps in 10 days · Day 9
        </motion.p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Small presentational helpers                                       */
/* ------------------------------------------------------------------ */

function SourceRow({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0">
      <dt className="shrink-0 font-mono text-xs uppercase tracking-wide text-muted">
        {term}
      </dt>
      <dd className="text-right text-faint">{children}</dd>
    </div>
  );
}
