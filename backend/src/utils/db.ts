import { createClient } from "@libsql/client";
import logger from "./logger";

const tursoUrl = process.env.TURSO_URL;
const tursoToken = process.env.TURSO_TOKEN;

if (!tursoUrl || !tursoToken) {
  throw new Error("Missing TURSO_URL or TURSO_TOKEN environment variables");
}

const db = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

(async () => {
  try {
    const result = await db.execute(
      "SELECT COUNT(*) as count FROM weather_daily",
    );
    const rowCount = result.rows[0]?.count || 0;
    logger.info(`Connected to Turso — weather_daily: ${rowCount} rows`);
  } catch (error) {
    logger.error("Failed to connect to Turso", { error });
  }
})();

export default db;
