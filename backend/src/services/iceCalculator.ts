import db from "../utils/db";
import { IceResult, WeatherRow } from "../types";

const STEFAN_CONSTANT = 2.5;
const COW_THRESHOLD_CM = 15;

export function calculateIceForMonth(
  year: number,
  month: number
): IceResult {
  const startDate = new Date(year - 1, 9, 1); // Oct 1 of previous year
  const endDate = new Date(year, month, 0); // Last day of selected month

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  const allTemps = db
    .prepare(
      `
      SELECT date, temp_c FROM weather_daily
      WHERE date >= ? AND date <= ?
      ORDER BY date ASC
    `
    )
    .all(
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    ) as WeatherRow[];

  let fddSum = 0;
  let maxIceCm = 0;
  let bestDate: string | null = null;
  let fddAtPeak = 0;
  let freezeDays = 0;
  let thawDays = 0;

  for (const row of allTemps) {
    const temp = row.temp_c;

    if (temp < 0) {
      fddSum += Math.abs(temp);
      freezeDays++;
    } else if (temp > 0) {
      fddSum = Math.max(0, fddSum - temp);
      thawDays++;
    }

    const iceCm = STEFAN_CONSTANT * Math.sqrt(fddSum);

    const currentDate = new Date(row.date);
    if (currentDate >= monthStart && currentDate <= monthEnd) {
      if (iceCm > maxIceCm) {
        maxIceCm = iceCm;
        bestDate = row.date;
        fddAtPeak = parseFloat(fddSum.toFixed(1));
      }
    }
  }

  const holdsCow = maxIceCm >= COW_THRESHOLD_CM;
  const maxIceCmFormatted = parseFloat(maxIceCm.toFixed(1));

  const message = holdsCow
    ? `Tjock is! ${maxIceCmFormatted}cm on ${bestDate || "N/A"}`
    : `Inte tjock nog. Max: ${maxIceCmFormatted}cm`;

  return {
    year,
    month,
    bestDate,
    maxIceCm: maxIceCmFormatted,
    holdsCow,
    fddAtPeak,
    freezeDays,
    thawDays,
    message,
  };
}
