import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./utils/db";
import iceRouter from "./routes/ice";
import logger from "./utils/logger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
  })
);

app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info(`${req.method} ${req.path}`, {
      status: res.statusCode,
      ms: Date.now() - start,
      query: req.query,
    });
  });
  next();
});

app.get("/health", async (_req, res) => {
  try {
    const result = await db.execute("SELECT COUNT(*) as count FROM weather_daily");
    const rowCount = result.rows[0]?.count || 0;
    res.status(200).json({
      status: "ok",
      db_rows: rowCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Health check failed", { error });
    res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.use("/api/ice", iceRouter);

app.listen(PORT, () => {
  logger.info(`Ko på Isen backend running on port ${PORT}`);
  logger.info(`Allowed origins: ${allowedOrigins.join(", ")}`);
});
