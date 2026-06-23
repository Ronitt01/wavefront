import { z } from "zod";

/**
 * Input to /api/brief — ONLY the scenario id. The server is the source of truth
 * for every number (arrival, distance, magnitude) and the coast label; the client
 * cannot supply or influence them. This keeps the "every number is computed,
 * never invented" promise even against a hand-crafted request.
 */
export const BriefInputSchema = z.object({
  scenarioId: z.string().min(1).max(64),
});
export type BriefInput = z.infer<typeof BriefInputSchema>;

/**
 * Output — prose only. Calm, actionable, never sensational. The headline/briefing
 * echo the server-computed numbers; doNow are standard, accurate tsunami-safety actions.
 */
export const BriefOutputSchema = z.object({
  headline: z.string().min(1).max(160),
  briefing: z.string().min(1).max(700),
  doNow: z.array(z.string().min(1).max(160)).min(2).max(4),
});
export type BriefOutput = z.infer<typeof BriefOutputSchema>;
