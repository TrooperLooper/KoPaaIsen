import { z } from "zod";

// Validates the shape of the /api/ice response at runtime.
// If the backend contract changes, this will throw a clear error
// instead of silently passing undefined values into the UI.
export const IceResultSchema = z.object({
  year: z.number().int(),
  month: z.number().int(),
  bestDate: z.string().nullable(),
  maxIceCm: z.number(),
  holdsCow: z.boolean(),
  fddAtPeak: z.number(),
  freezeDays: z.number().int(),
  thawDays: z.number().int(),
  message: z.string(),
});

export type IceResult = z.infer<typeof IceResultSchema>;
