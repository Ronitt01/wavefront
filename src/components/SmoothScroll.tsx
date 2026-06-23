"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { setScrollProgress } from "@/lib/scroll";

/**
 * Wraps the app in Lenis smooth-scroll and feeds normalized progress into the
 * scroll store (see lib/scroll.ts) that the 3D canvas reads each frame.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      // gentle easing for a cinematic, weighty feel
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on("scroll", ({ scroll, limit }: { scroll: number; limit: number }) => {
      setScrollProgress(limit > 0 ? scroll / limit : 0);
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
