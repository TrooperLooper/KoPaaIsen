import { calculateIceForMonth } from "../iceCalculator";

jest.mock("../../utils/db", () => ({
  execute: jest.fn(),
}));

import db from "../../utils/db";

const mockDb = db as jest.Mocked<any>;

const mockResultSet = (rows: any[]) => ({
  rows,
  columns: ["date", "temp_c"],
  columnTypes: ["TEXT", "REAL"],
  rowsAffected: 0,
  lastInsertRowid: 0n,
  toJSON: () => ({ rows }),
});

describe("calculateIceForMonth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("queries database from October of previous year through end of selected month", async () => {
    mockDb.execute.mockResolvedValueOnce(mockResultSet([]));

    await calculateIceForMonth(2000, 1);

    const calls = mockDb.execute.mock.calls;
    const args = calls[0][0].args;
    expect(args[0]).toMatch(/1999-09-30|1999-10-01/);
    expect(args[1]).toMatch(/2000-01-30|2000-01-31/);
  });

  it("accumulates freezing degree days and calculates ice thickness", async () => {
    // Oct 1-31: 31 days @ -5°C = 155 FDD
    // Jan 1-31: 31 days @ -5°C = 310 FDD total
    // Stefan: 2.5 * √310 ≈ 43.9 cm
    const octDays = Array.from({ length: 31 }, (_, i) => ({
      date: `1999-10-${String(i + 1).padStart(2, "0")}`,
      temp_c: -5,
    }));
    const janDays = Array.from({ length: 31 }, (_, i) => ({
      date: `2000-01-${String(i + 1).padStart(2, "0")}`,
      temp_c: -5,
    }));

    mockDb.execute.mockResolvedValueOnce(
      mockResultSet([...octDays, ...janDays]),
    );
    const result = await calculateIceForMonth(2000, 1);

    expect(result.maxIceCm).toBeCloseTo(43.9, 0);
    expect(result.freezeDays).toBeGreaterThan(50);
  });

  it("reduces ice when thawing occurs", async () => {
    const octDays = Array.from({ length: 30 }, (_, i) => ({
      date: `1999-10-${String(i + 1).padStart(2, "0")}`,
      temp_c: -4,
    }));
    const janDays = [
      ...Array.from({ length: 10 }, (_, i) => ({
        date: `2000-01-${String(i + 1).padStart(2, "0")}`,
        temp_c: -5,
      })),
      ...Array.from({ length: 21 }, (_, i) => ({
        date: `2000-01-${String(i + 11).padStart(2, "0")}`,
        temp_c: 3,
      })),
    ];

    mockDb.execute.mockResolvedValueOnce(
      mockResultSet([...octDays, ...janDays]),
    );
    const result = await calculateIceForMonth(2000, 1);

    expect(result.thawDays).toBe(21);
    expect(result.maxIceCm).toBeGreaterThan(10);
  });

  it("returns holdsCow=true when ice reaches 11cm threshold", async () => {
    const octDays = Array.from({ length: 25 }, (_, i) => ({
      date: `1999-10-${String(i + 1).padStart(2, "0")}`,
      temp_c: -1,
    }));
    const janDays = Array.from({ length: 20 }, (_, i) => ({
      date: `2000-01-${String(i + 1).padStart(2, "0")}`,
      temp_c: -1,
    }));

    mockDb.execute.mockResolvedValueOnce(
      mockResultSet([...octDays, ...janDays]),
    );
    const result = await calculateIceForMonth(2000, 1);

    expect(result.holdsCow).toBe(true);
    expect(result.maxIceCm).toBeGreaterThanOrEqual(11);
  });

  it("returns holdsCow=false when ice is too thin", async () => {
    const octDays = Array.from({ length: 5 }, (_, i) => ({
      date: `1999-10-${String(i + 1).padStart(2, "0")}`,
      temp_c: -1,
    }));
    const janDays = [{ date: "2000-01-01", temp_c: 0 }];

    mockDb.execute.mockResolvedValueOnce(
      mockResultSet([...octDays, ...janDays]),
    );
    const result = await calculateIceForMonth(2000, 1);

    expect(result.holdsCow).toBe(false);
    expect(result.maxIceCm).toBeLessThan(11);
  });

  it("records the date when peak ice occurs within target month", async () => {
    const octDays = Array.from({ length: 31 }, (_, i) => ({
      date: `1999-10-${String(i + 1).padStart(2, "0")}`,
      temp_c: -2,
    }));
    const janDays = [
      ...Array.from({ length: 15 }, (_, i) => ({
        date: `2000-01-${String(i + 1).padStart(2, "0")}`,
        temp_c: -8,
      })),
      ...Array.from({ length: 16 }, (_, i) => ({
        date: `2000-01-${String(i + 16).padStart(2, "0")}`,
        temp_c: 0,
      })),
    ];

    mockDb.execute.mockResolvedValueOnce(
      mockResultSet([...octDays, ...janDays]),
    );
    const result = await calculateIceForMonth(2000, 1);

    expect(result.bestDate).toContain("2000-01-15");
    expect(result.year).toBe(2000);
    expect(result.month).toBe(1);
  });

  it("handles no temperature data gracefully", async () => {
    mockDb.execute.mockResolvedValueOnce(mockResultSet([]));

    const result = await calculateIceForMonth(2000, 1);

    expect(result.maxIceCm).toBe(0);
    expect(result.holdsCow).toBe(false);
    expect(result.freezeDays).toBe(0);
    expect(result.thawDays).toBe(0);
    expect(result.bestDate).toBeNull();
  });
});
