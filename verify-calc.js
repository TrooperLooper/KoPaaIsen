const Database = require("better-sqlite3");
const db = new Database(
  "/Users/lars/Documents/Backendcourse/KoPaaIsen/weather.db",
);

const rows = db
  .prepare(
    `
  SELECT date, temp_c FROM weather_daily 
  WHERE date >= '1941-10-01' AND date <= '1942-02-28' 
  ORDER BY date
`,
  )
  .all();

let fddSum = 0;
let freezeDays = 0;
let thawDays = 0;
let maxIceCm = 0;
let maxIceDate = null;

for (const row of rows) {
  const temp = row.temp_c;

  // Backend logic
  if (temp < 0) {
    fddSum += Math.abs(temp);
    freezeDays++;
  } else if (temp > 0) {
    fddSum = Math.max(0, fddSum - temp);
    thawDays++;
  }

  // Stefan's formula: I = 2.5 * sqrt(FDD)
  const iceCm = 2.5 * Math.sqrt(fddSum);

  // Track peak during February
  if (row.date.includes("1942-02") && iceCm > maxIceCm) {
    maxIceCm = iceCm;
    maxIceDate = row.date;
  }
}

console.log("Oct 1941 - Feb 1942 FDD Calculation:");
console.log(`  Final FDD Sum: ${fddSum.toFixed(1)}`);
console.log(`  Freeze days: ${freezeDays}`);
console.log(`  Thaw days: ${thawDays}`);
console.log(
  `  Peak ice in Feb 1942: ${maxIceCm.toFixed(1)}cm on ${maxIceDate}`,
);
console.log(`  Holds cow (≥15cm)? ${maxIceCm >= 15 ? "YES ✓" : "NO ✗"}`);

db.close();
