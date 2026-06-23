import {
  Waves,
  TriangleAlert,
  MountainSnow,
  Satellite,
  Activity,
  ScrollText,
} from "lucide-react";

const DATA_SOURCES = [
  {
    icon: Waves,
    label: "Bathymetry",
    value: "AWS Terrain Tiles",
    note: "Public terrarium tiles — real global ocean depth",
  },
  {
    icon: Satellite,
    label: "Earth imagery",
    value: "NASA Blue Marble & Earth at Night",
    note: "Public domain",
  },
  {
    icon: Activity,
    label: "Epicenters",
    value: "USGS ComCat",
    note: "Observed quake parameters",
  },
  {
    icon: ScrollText,
    label: "Lisbon 1755 · Crete 365",
    value: "Cited historical estimates",
    note: "Hellenic Arc & Iberia–Morocco margin",
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-abyss">
      {/* subtle horizon glow at the very bottom of the page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-iso/40 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[120%] -translate-x-1/2 rounded-[100%] bg-iso/[0.06] blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
        {/* ── The disclaimer: the most important thing in the footer ── */}
        <div className="rounded-2xl border border-gold/25 bg-surface/60 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div
              aria-hidden
              className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold"
            >
              <TriangleAlert className="size-5" strokeWidth={1.75} />
            </div>
            <div className="space-y-3">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-gold">
                Educational — not a warning system
              </p>
              <p className="max-w-3xl text-pretty text-sm leading-relaxed text-muted sm:text-base">
                Wavefront is an educational preparedness visualization. It is{" "}
                <span className="font-medium text-ink">
                  not a real-time tsunami warning system
                </span>{" "}
                and must never be relied on during an actual event.
              </p>
              <div className="flex items-start gap-2.5 rounded-xl border border-safe/20 bg-safe/[0.05] px-4 py-3">
                <MountainSnow
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-safe"
                  strokeWidth={1.75}
                />
                <p className="text-sm leading-relaxed text-ink/90">
                  If you feel a strong or long earthquake near the coast,{" "}
                  <span className="font-medium text-safe">
                    move to high ground immediately
                  </span>{" "}
                  — do not wait for an official alert.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Data sources / the moat ── */}
        <div className="mt-16">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-faint">
            Computed from real data
          </p>
          <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {DATA_SOURCES.map((src) => (
              <div
                key={src.label}
                className="flex flex-col gap-3 bg-abyss p-5"
              >
                <src.icon
                  aria-hidden
                  className="size-5 text-iso"
                  strokeWidth={1.5}
                />
                <div className="space-y-1">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
                    {src.label}
                  </p>
                  <p className="text-sm font-medium leading-snug text-ink">
                    {src.value}
                  </p>
                  <p className="text-xs leading-relaxed text-muted">
                    {src.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-faint">
            Every arrival time is computed deterministically by a Fast Marching
            (Eikonal) solver over real ocean depth — never invented by an AI.
            Validated against the record: Chile 1960 → Hilo modeled at 14.9 h
            vs ~15 h observed.
          </p>
        </div>

        {/* ── Wordmark + credit ── */}
        <div className="mt-16 flex flex-col gap-8 border-t border-line pt-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="flex size-9 items-center justify-center rounded-lg border border-iso/25 bg-iso/10 text-iso"
              >
                <Waves className="size-5" strokeWidth={1.75} />
              </span>
              <span className="font-display text-2xl font-semibold tracking-tight text-ink text-glow-iso">
                Wavefront
              </span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              A planetary, no-login look at how fast a tsunami crosses an ocean
              — for any coast on Earth.
            </p>
          </div>

          <div className="space-y-2 sm:text-right">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-faint">
              Built by Ronit
            </p>
            <p className="text-sm text-muted">
              10 web apps in 10 days ·{" "}
              <span className="font-mono text-iso">Day 9</span>
            </p>
          </div>
        </div>

        <p className="mt-10 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-faint/70">
          © {new Date().getFullYear()} Wavefront · Educational use only
        </p>
      </div>
    </footer>
  );
}
