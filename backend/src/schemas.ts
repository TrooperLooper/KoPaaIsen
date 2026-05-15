import { z } from "zod";

// Validates a single row from the weather_daily table.
// Protects against schema drift or unexpected NULL values from the database.
export const WeatherRowSchema = z.object({
  date: z.string(),
  temp_c: z.number(),
});

export const WeatherRowsSchema = z.array(WeatherRowSchema);

// Shape of the API response — derive backend types from here.
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
