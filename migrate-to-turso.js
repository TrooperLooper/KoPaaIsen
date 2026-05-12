import Database from "better-sqlite3";
import { createClient } from "@libsql/client";

const localDb = new Database("./weather.db");
const tursoUrl = process.argv[2] || process.env.TURSO_URL;
const tursoToken = process.argv[3] || process.env.TURSO_TOKEN;

if (!tursoUrl || !tursoToken) {
  console.error("❌ Missing TURSO_URL or TURSO_TOKEN environment variables");
  process.exit(1);
}

const tursoDb = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

async function migrate() {
  try {
    console.log("📦 Starting migration to Turso...\n");

    // Get all rows from local SQLite
    const rows = localDb
      .prepare("SELECT * FROM weather_daily ORDER BY date ASC")
      .all();

    console.log(`📊 Found ${rows.length} rows to migrate`);

    // Create table in Turso if it doesn't exist
    console.log("🔨 Creating table schema in Turso...");
    await tursoDb.execute(`
      CREATE TABLE IF NOT EXISTS weather_daily (
        id INTEGER PRIMARY KEY,
        date TEXT NOT NULL UNIQUE,
        temp_c REAL NOT NULL
      )
    `);

    // Insert data in batches (Turso has limits on transaction size)
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);

      // Build insert statement
      const values = batch
        .map(
          (row, idx) =>
            `('${row.date}', ${row.temp_c})`
        )
        .join(",");

      await tursoDb.execute(
        `INSERT OR REPLACE INTO weather_daily (date, temp_c) VALUES ${values}`
      );

      console.log(
        `✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(rows.length / batchSize)}`
      );
    }

    // Verify
    const result = await tursoDb.execute(
      "SELECT COUNT(*) as count FROM weather_daily"
    );
    const count = result.rows[0]?.count || 0;

    console.log(`\n✅ Migration complete!`);
    console.log(`   Total rows in Turso: ${count}`);
    console.log(`   Database: ${tursoUrl}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
