import {
  BriefInputSchema,
  BriefOutputSchema,
  type BriefOutput,
} from "@/lib/brief-schema";
import { getScenario } from "@/lib/scenarios";
import type { ScenarioId } from "@/lib/types";
import baked from "@/lib/baked.json";

export const runtime = "nodejs";

type Baked = Record<string, { arrivalMinutes: number; distanceKm: number }>;
const BAKED = baked as Baked;

/** Server-authoritative facts for one scenario. The client cannot supply these. */
interface Facts {
  coastLabel: string;
  arrivalMinutes: number;
  distanceKm: number;
  magnitude: number;
}

// In-memory per-IP token bucket + per-scenario brief cache. Best-effort on
// serverless (per-instance), but combined with caching it bounds Gemini cost to
// ~one call per scenario per instance and blunts scripted abuse.
const buckets = new Map<string, { tokens: number; ts: number }>();
const CAP = 8;
const REFILL_PER_MS = 1 / 6000; // 1 token / 6s

function allow(ip: string, now: number): boolean {
  const b = buckets.get(ip) ?? { tokens: CAP, ts: now };
  b.tokens = Math.min(CAP, b.tokens + (now - b.ts) * REFILL_PER_MS);
  b.ts = now;
  if (b.tokens < 1) {
    buckets.set(ip, b);
    return false;
  }
  b.tokens -= 1;
  buckets.set(ip, b);
  return true;
}

const briefCache = new Map<string, BriefOutput>();

/**
 * POST /api/brief  { scenarioId }
 * Returns a calm, plain-language survival briefing for the scenario. Numbers come
 * from the server (baked field + scenario table) and are never client-supplied.
 */
export async function POST(request: Request) {
  // Date.now() is allowed in a route handler (not a workflow script).
  const now = Date.now();
  const ip = (request.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  if (!allow(ip, now)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BriefInputSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const scenario = getScenario(parsed.data.scenarioId as ScenarioId);
  const computed = BAKED[parsed.data.scenarioId];
  if (!scenario || !computed) {
    return Response.json({ error: "Unknown scenario" }, { status: 404 });
  }

  const facts: Facts = {
    coastLabel: scenario.featuredCoast.label,
    arrivalMinutes: computed.arrivalMinutes,
    distanceKm: computed.distanceKm,
    magnitude: scenario.magnitude,
  };

  const cached = briefCache.get(parsed.data.scenarioId);
  if (cached) return Response.json({ ...cached, source: "cache" });

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return Response.json({ ...fallbackBrief(facts), source: "deterministic" });
  }

  try {
    const out = await generateBrief(facts, key);
    briefCache.set(parsed.data.scenarioId, out);
    return Response.json({ ...out, source: "ai" });
  } catch {
    return Response.json({ ...fallbackBrief(facts), source: "deterministic" });
  }
}

const SYSTEM_INSTRUCTION = `You write short, calm tsunami-preparedness briefings for an EDUCATIONAL visualization called Wavefront. This is NOT a live warning system.

Hard rules:
- You are given exact numbers (arrival minutes, distance, magnitude). Echo them faithfully. NEVER invent, alter, or add any number, statistic, casualty figure, or date.
- Tone: calm, clear, human. Never sensational, never alarmist, no exclamation marks.
- The most important real-world truth to convey: if someone feels a strong or long earthquake near the coast, they must move to high ground IMMEDIATELY and not wait for an official alert or a countdown.
- Plain language, ~6th grade reading level. No jargon.
- Output ONLY valid JSON matching the requested shape. No markdown, no extra keys.`;

async function generateBrief(facts: Facts, key: string): Promise<BriefOutput> {
  const userPrompt = `Write a briefing for this historical scenario.
- Coast: ${facts.coastLabel}
- Tsunami travel time to this coast: ${Math.round(facts.arrivalMinutes)} minutes
- Distance from the epicenter: ${Math.round(facts.distanceKm)} km
- Earthquake magnitude: Mw ${facts.magnitude}

Return JSON with exactly these keys:
- "headline": one calm sentence stating when the water reaches this coast, using the given minutes.
- "briefing": 2-3 sentences. Explain that the wave crossed ${Math.round(
    facts.distanceKm,
  )} km of ocean in ${Math.round(
    facts.arrivalMinutes,
  )} minutes, and why that time is what matters for survival. End on the core action: move to high ground immediately, don't wait.
- "doNow": an array of 3 short, standard tsunami-safety actions (imperative voice).`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.55, responseMimeType: "application/json" },
    }),
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty model response");
  return BriefOutputSchema.parse(JSON.parse(text)); // throws -> caller falls back
}

/** Deterministic, always-honest briefing built purely from server facts. */
function fallbackBrief(facts: Facts): BriefOutput {
  const mins = Math.round(facts.arrivalMinutes);
  const km = Math.round(facts.distanceKm);
  const timePhrase =
    mins >= 90
      ? `about ${Math.round(mins / 60)} hour${Math.round(mins / 60) === 1 ? "" : "s"}`
      : `about ${mins} minutes`;

  return {
    headline: `The water reaches ${facts.coastLabel} in ${timePhrase} after the Mw ${facts.magnitude} quake.`,
    briefing: `The wave crossed roughly ${km.toLocaleString()} km of open ocean to get here in ${timePhrase}. That window is everything: a tsunami is not one wave but a series, and the safe response is the same everywhere — if you feel a strong or long earthquake near the coast, move to high ground immediately and do not wait for an official alert.`,
    doNow: [
      "Move to high ground or as far inland as you can, on foot.",
      "Don't wait for a warning — the shaking is your warning.",
      "Stay away from the coast until officials confirm it is safe; later waves can be larger.",
    ],
  };
}
