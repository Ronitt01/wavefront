"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Faq = {
  q: string;
  a: React.ReactNode;
};

const FAQS: Faq[] = [
  {
    q: "Is this a real-time tsunami warning system?",
    a: (
      <>
        No. Wavefront is an{" "}
        <span className="text-ink">educational preparedness visualization</span>
        , not a warning service. It replays history&rsquo;s deadliest tsunamis so the
        speed and reach of a wave become intuitive. It does not monitor live
        seismic feeds and will never alert you to an active event. For real
        warnings, rely on your national authority — and on the ground beneath
        your feet.
      </>
    ),
  },
  {
    q: "How accurate are the arrival times?",
    a: (
      <>
        Every time is{" "}
        <span className="text-ink">computed, not invented.</span> A Fast
        Marching (Eikonal) solver propagates the front across real ocean depth
        at the shallow-water speed{" "}
        <span className="font-mono text-iso">c = √(g · depth)</span>, so it
        refracts around islands and casts true shadow zones. The results match
        the record: Chile 1960 reaches Hilo, Hawai&lsquo;i at a modeled{" "}
        <span className="text-ink">14.9 hours</span> versus the ~15 hours
        actually observed, and Lisbon 1755 strikes its coast in ~40 minutes. The
        figures are modeled estimates for understanding — not exact predictions
        for any future event.
      </>
    ),
  },
  {
    q: "Where does the data come from?",
    a: (
      <>
        Ocean depth (bathymetry) comes from public{" "}
        <span className="text-ink">AWS Terrain Tiles</span> (terrarium tiles);
        the Earth imagery is{" "}
        <span className="text-ink">NASA Blue Marble & Earth at Night</span>{" "}
        (public domain); epicenters and magnitudes come from{" "}
        <span className="text-ink">USGS</span>. Lisbon 1755 and Crete 365 AD use
        cited historical estimates. Numbers are baked deterministically offline —
        an AI only phrases the plain-language survival brief, never the math.
      </>
    ),
  },
  {
    q: "What should I actually do in a real tsunami?",
    a: (
      <>
        If you feel a{" "}
        <span className="text-danger">strong or long earthquake</span> near the
        coast, treat the shaking itself as the warning:{" "}
        <span className="text-safe">move to high ground or inland</span>{" "}
        immediately and do not wait for an official alert. The wave can arrive in
        minutes. Stay away from the shore until authorities confirm it is safe —
        later waves are often larger than the first.
      </>
    ),
  },
  {
    q: "Does it work for my coast?",
    a: (
      <>
        That&rsquo;s the point. Unlike single-nation tools — NANOOS, for
        instance, covers only the US Pacific Northwest — Wavefront is{" "}
        <span className="text-ink">planetary.</span> The current scenarios span
        every ocean basin (Pacific, Indian, Atlantic, Mediterranean), and
        because the solver runs on global depth data, the same method extends to
        any coast on Earth. What you see here is the engine, demonstrated on
        history.
      </>
    ),
  },
  {
    q: "Do I need to sign up or share my location?",
    a: (
      <>
        No login, no account, no tracking. Wavefront runs entirely in your
        browser — pick a quake, scroll, and watch the front cross the ocean.
        Built by Ronit as Day 9 of &ldquo;10 web apps in 10 days.&rdquo;
      </>
    ),
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative bg-abyss py-24 sm:py-32"
    >
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 sm:mb-16"
        >
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-iso">
            Questions
          </p>
          <h2
            id="faq-heading"
            className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink text-balance sm:text-4xl"
          >
            What Wavefront is, and isn&rsquo;t.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            Calm, honest answers. The science is real; the intent is
            preparedness — not panic.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Accordion
            className="overflow-hidden rounded-2xl border border-line bg-surface/40 backdrop-blur-sm"
            aria-label="Frequently asked questions"
          >
            {FAQS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-line not-last:border-b"
              >
                <AccordionTrigger className="group/accordion-trigger gap-6 px-5 py-5 text-left font-display text-base font-medium text-ink no-underline transition-colors hover:bg-surface-2/40 hover:no-underline sm:px-6 [&_svg]:text-faint [&_svg]:transition-colors group-hover/accordion-trigger:[&_svg]:text-iso">
                  <span className="flex items-baseline gap-4">
                    <span
                      aria-hidden
                      className="mt-px font-mono text-xs tabular-nums text-faint"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="pt-px">{item.q}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-6 sm:px-6">
                  <p className="max-w-prose pl-0 text-sm leading-relaxed text-muted sm:pl-9">
                    {item.a}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Standing safety disclaimer — calm, persistent, unmissable */}
        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          role="note"
          aria-label="Safety disclaimer"
          className="mt-8 flex items-start gap-4 rounded-xl border border-line bg-surface/30 px-5 py-5 sm:px-6"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="mt-0.5 size-5 shrink-0 text-gold"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          <p className="text-sm leading-relaxed text-muted">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-gold">
              In a real event
            </span>
            <br className="hidden sm:block" />
            <span className="mt-1 inline-block">
              If you feel a strong or long earthquake near the coast,{" "}
              <span className="text-ink">
                move to high ground immediately
              </span>{" "}
              and do not wait for an official alert. Wavefront is for learning,
              not for warning.
            </span>
          </p>
        </motion.aside>
      </div>
    </section>
  );
}
