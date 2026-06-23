"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Mountain } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Particles } from "@/components/ui/particles";

/**
 * FinalCta — the closing invitation to scroll back up and "release the wave".
 * Big, confident, minimal. One headline, one primary action, one calm reminder.
 */
export function FinalCta() {
  const reduceMotion = useReducedMotion();

  function releaseTheWave() {
    // Smooth-scroll to the top of the page (the scroll-driven globe hero).
    if (typeof window === "undefined") return;
    window.history.replaceState(null, "", "#top");
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  const ease = [0.22, 1, 0.36, 1] as const;
  const rise = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section
      aria-labelledby="finalcta-heading"
      className="relative isolate overflow-hidden bg-abyss py-28 sm:py-40"
    >
      {/* Ambient cyan depth glow rising from the floor */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[70%] bg-[radial-gradient(60%_120%_at_50%_120%,rgba(62,233,255,0.16),transparent_70%)]"
      />
      {/* Fade in from the section above so it reads as one continuous deep-ocean canvas */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-abyss to-transparent"
      />
      {/* Drifting particulate — like plankton lit by the wavefront */}
      <Particles
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        quantity={reduceMotion ? 0 : 60}
        size={0.5}
        staticity={60}
        ease={70}
        color="#3ee9ff"
      />

      {/* Expanding isochrone arcs — the wavefront itself, abstracted */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 flex justify-center"
      >
        <div className="relative h-px w-full max-w-6xl">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute bottom-0 left-1/2 aspect-square w-[140vw] max-w-[1100px] -translate-x-1/2 translate-y-1/2 rounded-full border border-iso/20"
              initial={false}
              animate={
                reduceMotion
                  ? { opacity: 0.18 }
                  : { scale: [0.6, 1.05], opacity: [0.32, 0] }
              }
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: 6,
                      delay: i * 2,
                      repeat: Infinity,
                      ease: "easeOut",
                    }
              }
            />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          {/* Eyebrow */}
          <motion.p
            variants={rise}
            transition={{ duration: 0.6, ease }}
            className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-iso/80"
          >
            No login. No wait. Any coast on Earth.
          </motion.p>

          {/* Headline */}
          <motion.h2
            id="finalcta-heading"
            variants={rise}
            transition={{ duration: 0.7, ease }}
            className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl"
          >
            Pick a quake.
            <br className="hidden sm:block" />{" "}
            <span className="text-iso text-glow-iso">Release the wave.</span>
          </motion.h2>

          {/* Subhead */}
          <motion.p
            variants={rise}
            transition={{ duration: 0.7, ease }}
            className="mt-6 max-w-xl text-balance text-base leading-relaxed text-muted sm:text-lg"
          >
            Scroll the globe and watch a real wavefront race across the open ocean
            at ~800 km/h. The countdown lands on the modeled arrival at the coast —
            every number computed, never invented.
          </motion.p>

          {/* Primary action */}
          <motion.div
            variants={rise}
            transition={{ duration: 0.7, ease }}
            className="mt-10"
          >
            <Button
              type="button"
              size="lg"
              onClick={releaseTheWave}
              className="group h-14 gap-2.5 rounded-full border border-iso/40 bg-iso/10 px-8 text-base font-medium text-iso shadow-[0_0_40px_-8px_rgba(62,233,255,0.5)] transition-all hover:bg-iso/15 hover:shadow-[0_0_60px_-6px_rgba(62,233,255,0.7)] focus-visible:ring-iso/50"
            >
              <ArrowUp
                className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5"
                aria-hidden
              />
              Back to the globe
            </Button>
          </motion.div>

          {/* Calm safety reminder */}
          <motion.p
            variants={rise}
            transition={{ duration: 0.7, ease }}
            className="mt-12 flex max-w-xl items-start justify-center gap-2.5 text-sm leading-relaxed text-faint"
          >
            <Mountain
              className="mt-0.5 size-4 shrink-0 text-safe/70"
              aria-hidden
            />
            <span>
              This is an educational visualization, not a warning system. In a
              real event — if you feel a strong or long earthquake near the coast,
              move to <span className="text-safe">high ground immediately</span>{" "}
              and do not wait for an alert.
            </span>
          </motion.p>

          {/* Credit */}
          <motion.p
            variants={rise}
            transition={{ duration: 0.7, ease }}
            className="mt-14 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-faint/70"
          >
            Wavefront · Built by Ronit · 10 web apps in 10 days · Day 9
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
