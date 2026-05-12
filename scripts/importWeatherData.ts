/**
 * Import SMHI weather data from 3 CSV files into SQLite
 * Merges files with overlap deduplication
 *
 * File 1: 1917-03-01 → 1964-05-31
 * File 2: 1926-06-01 → 1989-12-31 (skip before 1965-01-01 to avoid overlap with File 1)
 * File 3: 1990-01-01 → 2026-02-01
 */

import fs from "fs";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "..", "weather.db");
const dataDir = path.join(__dirname, "..", "data");

const db = new Database(dbPath);

// Track all weather data: date -> tempC
const weatherData = new Map<string, number>();

/**
 * Parse a single CSV file
 * Columns: [from, to, date, temp, quality, ...]
 * We care about: date (index 2), temp (index 3), quality (index 4)
 */
function parseCSV(filePath: string, skipUntilDate?: string): number {
  console.log(`Parsing ${path.basename(filePath)}...`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return 0;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  let count = 0;
  let skipMode = skipUntilDate ? true : false;

  for (const line of lines) {
    if (!line.trim()) continue;

    const parts = line.split(";");
    if (parts.length < 5) continue; // Skip metadata rows

    const date = parts[2]?.trim(); // Representativt dygn
    const tempStr = parts[3]?.trim();
    const quality = parts[4]?.trim();

    // Skip invalid dates
    if (!date || date.length !== 10 || date[4] !== "-") continue;

    // Parse temperature
    const temp = parseFloat(tempStr || "NaN");
    if (isNaN(temp)) continue;

    // Skip rejected quality records
    if (quality === "R") continue;

    // Only keep G (approved) or Y (acceptable) quality
    if (quality !== "G" && quality !== "Y") continue;

    // Skip-until logic for File 2 overlap avoidance
    if (skipMode) {
      if (date >= (skipUntilDate || "")) {
        skipMode = false;
      } else {
        continue;
      }
    }

    // Store (only keep first occurrence per date)
    if (!weatherData.has(date)) {
      weatherData.set(date, temp);
      count++;
    }
  }

  console.log(`  ✓ Loaded ${count} records`);
  return count;
}

/**
 * Main import routine
 */
function main() {
  console.log("\n🐄 Ko på Isen — Weather Data Import\n");

  // Parse all 3 files
  let totalRecords = 0;

  totalRecords += parseCSV(path.join(dataDir, "smhi-1917-1964.csv"));
  totalRecords += parseCSV(
    path.join(dataDir, "smhi-1926-1989.csv"),
    "1965-01-01",
  ); // Skip until 1965
  totalRecords += parseCSV(path.join(dataDir, "smhi-1990-2026.csv"));

  console.log(`\n📊 Total unique dates: ${weatherData.size}`);

  // Create table
  db.exec(`
    DROP TABLE IF EXISTS weather_daily;
    CREATE TABLE weather_daily (
      date TEXT PRIMARY KEY,
      temp_c REAL NOT NULL
    );
    CREATE INDEX idx_date ON weather_daily(date);
  `);

  // Insert sorted data
  const sortedDates = Array.from(weatherData.keys()).sort();
  const insert = db.prepare(
    "INSERT INTO weather_daily (date, temp_c) VALUES (?, ?)",
  );

  const insertMany = db.transaction((data: Array<[string, number]>) => {
    for (const [date, temp] of data) {
      insert.run(date, temp);
    }
  });

  insertMany(sortedDates.map((date) => [date, weatherData.get(date)!]));

  console.log(`✅ Imported ${weatherData.size} days into ${dbPath}`);
  console.log(
    `   Date range: ${sortedDates[0]} → ${sortedDates[sortedDates.length - 1]}`,
  );

  db.close();
}

main();
