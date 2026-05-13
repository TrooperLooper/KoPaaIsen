import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_URL || "",
  authToken: process.env.TURSO_TOKEN || "",
});

const STEFAN_CONSTANT = 2.5;
const COW_THRESHOLD_CM = 11;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const year = parseInt(req.query.year as string, 10);
    const month = parseInt(req.query.month as string, 10);

    const VALID_MONTHS = [10, 11, 12, 1, 2, 3, 4, 5];
    const MIN_YEAR = 1917;
    const MAX_YEAR = 2026;

    if (isNaN(year) || isNaN(month)) {
      return res.status(400).json({
        error: "Invalid year or month",
        details: "year and month must be integers",
      });
    }

    if (year < MIN_YEAR || year > MAX_YEAR) {
      return res.status(400).json({
        error: "Year out of range",
        details: `year must be between ${MIN_YEAR} and ${MAX_YEAR}`,
      });
    }

    if (month < 1 || month > 12 || !VALID_MONTHS.includes(month)) {
      return res.status(400).json({
        error: "Invalid month",
        details: `month must be one of: ${VALID_MONTHS.join(", ")}`,
      });
    }

    const startDate = new Date(year - 1, 9, 1);
    const endDate = new Date(year, month, 0);

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

    const allTemps = result.rows as Array<{
      date: string;
      temp_c: number;
    }>;

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

    res.status(200).json({
      year,
      month,
      bestDate,
      maxIceCm: maxIceCmFormatted,
      holdsCow,
      fddAtPeak,
      freezeDays,
      thawDays,
      message: holdsCow
        ? `Tjock is! ${maxIceCmFormatted}cm on ${bestDate || "N/A"}`
        : `Inte tjock nog. Max: ${maxIceCmFormatted}cm`,
    });
  } catch (error) {
    console.error("Error in /api/ice", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
