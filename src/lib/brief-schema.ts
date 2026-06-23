import { z } from "zod";

/**
 * Input to /api/brief — these numbers are computed by the deterministic engine
 * (baked from real bathymetry) and INJECTED. The model never produces them.
 */
export const BriefInputSchema = z.object({
  scenarioId: z.string().min(1).max(64),
  coastLabel: z.string().min(1).max(120),
  arrivalMinutes: z.number().finite().min(0).max(2880),
  distanceKm: z.number().finite().min(0).max(25000),
  magnitude: z.number().finite().min(0).max(10),
});
export type BriefInput = z.infer<typeof BriefInputSchema>;

/**
 * Output — prose only. Calm, actionable, never sensational. The headline/briefing
 * echo the injected numbers; doNow are standard, accurate tsunami-safety actions.
 */
export const BriefOutputSchema = z.object({
  headline: z.string().min(1).max(160),
  briefing: z.string().min(1).max(700),
  doNow: z.array(z.string().min(1).max(160)).min(2).max(4),
});
export type BriefOutput = z.infer<typeof BriefOutputSchema>;
