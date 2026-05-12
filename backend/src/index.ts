import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./utils/db";
import iceRouter from "./routes/ice";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  const rowCount = db
    .prepare("SELECT COUNT(*) as count FROM weather_daily")
    .get() as { count: number };

  res.status(200).json({
    status: "ok",
    db_rows: rowCount.count,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/ice", iceRouter);

app.listen(PORT, () => {
  console.log(`\n🐄 Ko på Isen backend running on port ${PORT}`);
  console.log(`   http://localhost:${PORT}/health\n`);
});
