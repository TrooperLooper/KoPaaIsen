import { WeatherRow } from "../types";
import { IceResult } from "../types";

const STEFAN_CONSTANT = 2.5; // empirical constant for ice growth (cm / sqrt(FDD))
const COW_THRESHOLD_CM = 11; // Gold's rule: minimum ice for a 400 kg cow on saltwater

/**
 * Accumulates freezing degree days (FDD) from a sequence of daily temperatures,
 * then applies Stefan's formula to find the thickest ice within a target month.
 *
 * Pure function — no I/O, no side effects. Safe to unit test with any data.
 */
export function calculateIceFromTemperatures(
  rows: WeatherRow[],
  monthStart: Date,
  monthEnd: Date,
  year: number,
  month: number
): IceResult {
  let fddSum = 0;
  let maxIceCm = 0;
  let bestDate: string | null = null;
  let fddAtPeak = 0;
  let freezeDays = 0;
  let thawDays = 0;

  for (const row of rows) {
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
