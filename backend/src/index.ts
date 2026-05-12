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
    res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.use("/api/ice", iceRouter);

app.listen(PORT, () => {
  console.log(`\n🐄 Ko på Isen backend running on port ${PORT}`);
  console.log(`   http://localhost:${PORT}/health\n`);
});
