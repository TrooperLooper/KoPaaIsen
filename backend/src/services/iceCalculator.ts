import db from "../utils/db";
import { IceResult } from "../types";
import { WeatherRowsSchema } from "../schemas";
import { calculateIceFromTemperatures } from "../utils/icePhysics";

export async function calculateIceForMonth(
  year: number,
  month: number
): Promise<IceResult> {
  const startDate = new Date(year - 1, 9, 1); // Oct 1 of previous year
  const endDate = new Date(year, month, 0); // last day of selected month
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  const result = await db.execute({
    sql: `
      SELECT date, temp_c FROM weather_daily
      WHERE date >= ? AND date <= ?
      ORDER BY date ASC
    `,
    args: [
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0],
    ],
  });

  const rows = WeatherRowsSchema.parse(result.rows);

  return calculateIceFromTemperatures(rows, monthStart, monthEnd, year, month);
}
