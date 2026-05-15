import { calculateIceFromTemperatures } from "../icePhysics";
import { WeatherRow } from "../../types";

// Helper: build a sequence of daily rows from Oct 1 of (year-1) onward
function makeRows(
  startYear: number,
  temps: number[] // one per day starting Oct 1
): WeatherRow[] {
  const rows: WeatherRow[] = [];
  let d = new Date(startYear, 9, 1); // Oct 1
  for (const temp of temps) {
    rows.push({ date: d.toISOString().split("T")[0], temp_c: temp });
    d = new Date(d.getTime() + 86400000);
  }
  return rows;
}

// Stefan's formula: iceCm = 2.5 * sqrt(fddSum)
// Gold's rule threshold: 11 cm

describe("calculateIceFromTemperatures", () => {
  describe("warm winter — ice never forms", () => {
    it("returns holdsCow=false and maxIceCm=0 when all temps are above zero", () => {
      // All positive temps: fddSum stays 0, iceCm = 0
      const rows = makeRows(1999, Array(180).fill(5));
      const monthStart = new Date(2000, 0, 1); // Jan 2000
      const monthEnd = new Date(2000, 1, 0);   // Jan 31

      const result = calculateIceFromTemperatures(rows, monthStart, monthEnd, 2000, 1);

      expect(result.holdsCow).toBe(false);
      expect(result.maxIceCm).toBe(0);
      expect(result.freezeDays).toBe(0);
      expect(result.bestDate).toBeNull();
    });
  });

  describe("steady freeze — ice builds linearly", () => {
    it("calculates correct ice thickness for 100 days at -1°C", () => {
      // 100 days at -1°C starting Oct 1. December ends on day 92 (Oct=31, Nov=30, Dec=31).
      // fddSum on Dec 31 = 92 → iceCm = 2.5 * sqrt(92) ≈ 24cm
      const rows = makeRows(1999, Array(100).fill(-1));
      const monthStart = new Date(1999, 11, 1); // Dec 1999
      const monthEnd = new Date(2000, 0, 0);    // Dec 31

      const result = calculateIceFromTemperatures(rows, monthStart, monthEnd, 2000, 12);

      expect(result.maxIceCm).toBeCloseTo(24, 0);
      expect(result.holdsCow).toBe(true);
      expect(result.freezeDays).toBe(100);
    });

    it("reports holdsCow=false when ice is below 11cm threshold", () => {
      // 15 days at -1°C → fddSum=15 → iceCm = 2.5 * sqrt(15) ≈ 9.68cm < 11
      const rows = makeRows(1999, Array(15).fill(-1));
      const monthStart = new Date(1999, 9, 1);  // Oct 1999
      const monthEnd = new Date(1999, 10, 0);   // Oct 31

      const result = calculateIceFromTemperatures(rows, monthStart, monthEnd, 1999, 10);

      expect(result.maxIceCm).toBeLessThan(11);
      expect(result.holdsCow).toBe(false);
    });
  });

  describe("thaw and refreeze", () => {
    it("reduces fddSum when temp goes positive, then rebuilds on refreeze", () => {
      // 50 days at -2°C → fddSum=100 → iceCm=25cm
      // Then 10 days at +5°C → fddSum = max(0, 100-50) = 50 → iceCm≈17.7cm
      // Then 20 more days at -2°C → fddSum=90 → iceCm≈23.7cm
      const temps = [
        ...Array(50).fill(-2),
        ...Array(10).fill(5),
        ...Array(20).fill(-2),
      ];
      const rows = makeRows(1999, temps);
      const monthStart = new Date(2000, 0, 1); // Jan 2000 (around day 92+)
      const monthEnd = new Date(2000, 1, 0);

      const result = calculateIceFromTemperatures(rows, monthStart, monthEnd, 2000, 1);

      // fddSum never exceeds 100 again, so ice should be less than original peak
      expect(result.maxIceCm).toBeLessThan(25);
      expect(result.thawDays).toBe(10);
    });

    it("fddSum never goes below zero during thaw", () => {
      // 5 days at -1°C → fddSum=5, then 20 days at +5°C → should clamp at 0
      const temps = [...Array(5).fill(-1), ...Array(20).fill(5)];
      const rows = makeRows(1999, temps);
      const monthStart = new Date(1999, 9, 1);
      const monthEnd = new Date(1999, 10, 0);

      const result = calculateIceFromTemperatures(rows, monthStart, monthEnd, 1999, 10);

      expect(result.maxIceCm).toBeGreaterThanOrEqual(0);
    });
  });

  describe("extreme cold — 1942 scenario from README", () => {
    it("produces very thick ice (>40cm) after a historically cold winter", () => {
      // Oct 1 to Feb 28 = 31+30+31+31+28 = 151 days. Use 155 rows to cover all of February.
      // 155 days at -5.1°C → fddSum ≈ 790 → iceCm = 2.5 * sqrt(790) ≈ 70cm
      const temps = Array(155).fill(-5.1);
      const rows = makeRows(1941, temps);
      const monthStart = new Date(1942, 1, 1); // Feb 1942
      const monthEnd = new Date(1942, 2, 0);   // Feb 28

      const result = calculateIceFromTemperatures(rows, monthStart, monthEnd, 1942, 2);

      expect(result.holdsCow).toBe(true);
      expect(result.maxIceCm).toBeGreaterThan(40);
    });
  });

  describe("result shape", () => {
    it("returns correct year and month in all cases", () => {
      const rows = makeRows(2019, Array(90).fill(-3));
      const monthStart = new Date(2020, 0, 1);
      const monthEnd = new Date(2020, 1, 0);

      const result = calculateIceFromTemperatures(rows, monthStart, monthEnd, 2020, 1);

      expect(result.year).toBe(2020);
      expect(result.month).toBe(1);
    });

    it("sets bestDate to a string when ice forms during the month", () => {
      const rows = makeRows(1999, Array(120).fill(-3));
      const monthStart = new Date(2000, 0, 1);
      const monthEnd = new Date(2000, 1, 0);

      const result = calculateIceFromTemperatures(rows, monthStart, monthEnd, 2000, 1);

      expect(result.bestDate).not.toBeNull();
      expect(typeof result.bestDate).toBe("string");
    });
  });
});
