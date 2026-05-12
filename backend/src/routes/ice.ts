import express, { Request, Response } from "express";
import { calculateIceForMonth } from "../services/iceCalculator";

const router = express.Router();

const VALID_MONTHS = [10, 11, 12, 1, 2, 3, 4, 5]; // Oct-May
const MIN_YEAR = 1917;
const MAX_YEAR = 2026;

router.get("/:year/:month", async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);

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

    if (month < 1 || month > 12) {
      return res.status(400).json({
        error: "Month out of range",
        details: "month must be between 1 and 12",
      });
    }

    if (!VALID_MONTHS.includes(month)) {
      return res.status(400).json({
        error: "Invalid month for ice calculation",
        details: `month must be one of: ${VALID_MONTHS.join(", ")} (Oct-May only)`,
      });
    }

    const result = await calculateIceForMonth(year, month);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in /api/ice/:year/:month", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
