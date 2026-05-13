import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_URL || "",
  authToken: process.env.TURSO_TOKEN || "",
});

const STEFAN_CONSTANT = 2.5;
const COW_THRESHOLD_CM = 11;

export default {
  async fetch(request: Request) {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    };

    try {
      const { searchParams } = new URL(request.url);
      const year = parseInt(searchParams.get("year") || "0", 10);
      const month = parseInt(searchParams.get("month") || "0", 10);

      const VALID_MONTHS = [10, 11, 12, 1, 2, 3, 4, 5];
      const MIN_YEAR = 1917;
      const MAX_YEAR = 2026;

      if (isNaN(year) || isNaN(month)) {
        return new Response(
          JSON.stringify({
            error: "Invalid year or month",
            details: "year and month must be integers",
          }),
          { status: 400, headers }
        );
      }

      if (year < MIN_YEAR || year > MAX_YEAR) {
        return new Response(
          JSON.stringify({
            error: "Year out of range",
            details: `year must be between ${MIN_YEAR} and ${MAX_YEAR}`,
          }),
          { status: 400, headers }
        );
      }

      if (month < 1 || month > 12 || !VALID_MONTHS.includes(month)) {
        return new Response(
          JSON.stringify({
            error: "Invalid month",
            details: `month must be one of: ${VALID_MONTHS.join(", ")}`,
          }),
          { status: 400, headers }
        );
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

      return new Response(
        JSON.stringify({
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
        }),
        { status: 200, headers }
      );
    } catch (error) {
      console.error("Error in /api/ice", error);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          details: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};
