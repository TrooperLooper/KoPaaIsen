import { z } from "zod";
import { WeatherRowSchema, IceResultSchema } from "./schemas";

export type WeatherRow = z.infer<typeof WeatherRowSchema>;
export type IceResult = z.infer<typeof IceResultSchema>;
