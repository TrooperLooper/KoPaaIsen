import Database from "better-sqlite3";
import type BetterSqlite3 from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(process.cwd(), "..", "weather.db");
const db: BetterSqlite3.Database = new Database(dbPath);

db.pragma("journal_mode = WAL");

const rowCount = db
  .prepare("SELECT COUNT(*) as count FROM weather_daily")
  .get() as { count: number };

console.log(`✓ SQLite opened at ${dbPath}`);
console.log(`✓ weather_daily table: ${rowCount.count} rows`);

export default db;
