"use client";

import { motion, useReducedMotion } from "motion/react";
import { Clock, Globe2, TriangleAlert } from "lucide-react";

import { NumberTicker } from "@/components/ui/number-ticker";

/**
 * Stakes — the problem.
 * Minutes decide survival on the coast, ~700M people live in the strike zone,
 * and no tool gives any coast on Earth a personal "when would it reach me" answer.
 */
export function Stakes() {
  const reduce = useReducedMotion();

  const rise = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section
      aria-labelledby="stakes-heading"
      className="relative overflow-hidden bg-abyss py-24 sm:py-32"
    >
      {/* subtle horizon glow tying the section to the globe hero above */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-72 max-w-4xl rounded-full bg-iso/[0.06] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(62,233,255,0.05),transparent_60%)]"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* eyebrow */}
        <motion.p
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.28em] text-iso"
        >
          <span className="inline-block h-px w-8 bg-iso/50" aria-hidden />
          The stakes
        </motion.p>

        {/* headline */}
        <motion.h2
          id="stakes-heading"
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-6 max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl"
        >
          On the coast, survival is measured{" "}
          <span className="text-iso text-glow-iso">in minutes.</span>
        </motion.h2>

        <motion.p
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted sm:text-xl"
        >
          A seafloor quake can send a tsunami across an entire ocean. At the
          nearest coast the water can arrive in tens of minutes — long before
          any official alert can reach a phone.
        </motion.p>

        {/* the 700M figure — the centerpiece */}
        <motion.div
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.18 }}
          className="mt-16 border-t border-line pt-12 sm:mt-20 sm:pt-14"
        >
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-faint">
            People living in low-lying coastal zones
          </p>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span
              className="font-display text-7xl font-semibold leading-none tracking-tight text-ink tabular-nums sm:text-8xl md:text-[8.5rem]"
              aria-label="Approximately 700 million people"
            >
              <span className="text-faint" aria-hidden>
                ~
              </span>
              <NumberTicker
                value={700}
                className="text-ink !tracking-tight"
                aria-hidden
              />
              <span className="ml-2 align-baseline text-4xl font-normal text-iso sm:text-5xl md:text-6xl">
                million
              </span>
            </span>
          </div>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
            live within reach of the sea — the largest population ever exposed,
            and the safe-action window after a quake is the smallest it has ever
            mattered.
          </p>
        </motion.div>

        {/* the gap — three calm, specific cards */}
        <motion.div
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line/60 sm:mt-20 sm:grid-cols-3"
        >
          {[
            {
              icon: Clock,
              label: "Minutes, not hours",
              body: "Near-field waves can reach the coast in under an hour — sometimes in ten minutes.",
            },
            {
              icon: Globe2,
              label: "No global answer",
              body: "Official tools are single-nation or static PDFs. No service answers it for any coast on Earth.",
            },
            {
              icon: TriangleAlert,
              label: "The unanswered question",
              body: "“When would a wave reach MY coast?” — almost nobody has ever been able to see it.",
            },
          ].map(({ icon: Icon, label, body }) => (
            <div key={label} className="bg-abyss px-6 py-8 sm:px-7">
              <Icon
                className="size-5 text-iso"
                strokeWidth={1.6}
                aria-hidden
              />
              <h3 className="mt-4 font-display text-base font-medium text-ink">
                {label}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </motion.div>

        {/* the turn — sets up the product without overselling */}
        <motion.p
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 max-w-2xl text-pretty text-lg leading-relaxed text-ink sm:mt-16"
        >
          So we made the answer{" "}
          <span className="text-iso">visible for every ocean</span> — a
          wavefront you can watch cross real water, and a countdown that lands
          on the modeled arrival time at the coast.
        </motion.p>
      </div>
    </section>
  );
}
