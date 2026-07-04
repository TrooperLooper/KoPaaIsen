import express, { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { calculateIceForMonth } from "../services/iceCalculator";
import logger from "../utils/logger";

const router = express.Router();

const VALID_MONTHS = [10, 11, 12, 1, 2, 3, 4, 5]; // Oct-May
const MIN_YEAR = 1917;
const MAX_YEAR = 2026;

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests",
    details: "Max 60 requests per minute",
  },
});

router.get("/", limiter, async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string, 10);
    const month = parseInt(req.query.month as string, 10);

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
    res.set(
      "Cache-Control",
      "public, s-maxage=86400, max-age=86400, stale-while-revalidate=604800",
    );
    res.set("ETag", `"ice-${year}-${month}"`);
    return res.status(200).json(result);
  } catch (error) {
    logger.error("Error in GET /api/ice", { error, query: req.query });
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
