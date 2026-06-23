import {
  BriefInputSchema,
  BriefOutputSchema,
  type BriefInput,
  type BriefOutput,
} from "@/lib/brief-schema";

export const runtime = "nodejs";

/**
 * POST /api/brief
 *
 * Turns the deterministic engine's COMPUTED numbers into a calm, plain-language
 * survival briefing. The model only phrases — it is forbidden from inventing any
 * number. If there is no API key or the call fails/validates wrong, we fall back
 * to a deterministic template so the product never breaks and never lies.
 */
export async function POST(request: Request) {
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
  const input = parsed.data;

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return Response.json({ ...fallbackBrief(input), source: "deterministic" });
  }

  try {
    const out = await generateBrief(input, key);
    return Response.json({ ...out, source: "ai" });
  } catch {
    return Response.json({ ...fallbackBrief(input), source: "deterministic" });
  }
}

const SYSTEM_INSTRUCTION = `You write short, calm tsunami-preparedness briefings for an EDUCATIONAL visualization called Wavefront. This is NOT a live warning system.

Hard rules:
- You are given exact numbers (arrival minutes, distance, magnitude). Echo them faithfully. NEVER invent, alter, or add any number, statistic, casualty figure, or date.
- Tone: calm, clear, human. Never sensational, never alarmist, no exclamation marks.
- The most important real-world truth to convey: if someone feels a strong or long earthquake near the coast, they must move to high ground IMMEDIATELY and not wait for an official alert or a countdown.
- Plain language, ~6th grade reading level. No jargon.
- Output ONLY valid JSON matching the requested shape. No markdown, no extra keys.`;

async function generateBrief(input: BriefInput, key: string): Promise<BriefOutput> {
  const userPrompt = `Write a briefing for this historical scenario.
- Coast: ${input.coastLabel}
- Tsunami travel time to this coast: ${Math.round(input.arrivalMinutes)} minutes
- Distance from the epicenter: ${Math.round(input.distanceKm)} km
- Earthquake magnitude: Mw ${input.magnitude}

Return JSON with exactly these keys:
- "headline": one calm sentence stating when the water reaches this coast, using the given minutes.
- "briefing": 2-3 sentences. Explain that the wave crossed ${Math.round(
    input.distanceKm,
  )} km of ocean in ${Math.round(
    input.arrivalMinutes,
  )} minutes, and why that time is what matters for survival. End on the core action: move to high ground immediately, don't wait.
- "doNow": an array of 3 short, standard tsunami-safety actions (imperative voice).`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.55,
        responseMimeType: "application/json",
      },
    }),
    // keep the route snappy; fall back if the model is slow
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty model response");

  const json = JSON.parse(text);
  return BriefOutputSchema.parse(json); // throws -> caller falls back
}

/** Deterministic, always-honest briefing built purely from the injected numbers. */
function fallbackBrief(input: BriefInput): BriefOutput {
  const mins = Math.round(input.arrivalMinutes);
  const km = Math.round(input.distanceKm);
  const timePhrase =
    mins >= 90
      ? `about ${Math.round(mins / 60)} hour${Math.round(mins / 60) === 1 ? "" : "s"}`
      : `about ${mins} minutes`;

  return {
    headline: `The water reaches ${input.coastLabel} in ${timePhrase} after the Mw ${input.magnitude} quake.`,
    briefing: `The wave crossed roughly ${km.toLocaleString()} km of open ocean to get here in ${timePhrase}. That window is everything: a tsunami is not one wave but a series, and the safe response is the same everywhere — if you feel a strong or long earthquake near the coast, move to high ground immediately and do not wait for an official alert.`,
    doNow: [
      "Move to high ground or as far inland as you can, on foot.",
      "Don't wait for a warning — the shaking is your warning.",
      "Stay away from the coast until officials confirm it is safe; later waves can be larger.",
    ],
  };
}
