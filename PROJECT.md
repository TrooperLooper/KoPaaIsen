# Ko på Isen — Project Working Document

> **Animated cow on Malmö harbor ice.** User picks a year + month, the app calculates historical ice thickness using real weather data (1917–2017) and Freezing Degree-Day physics. Cow either stands proudly or plunges.

**Status**: Pre-development
**Target completion**: [Date TBD]

---

## 1. Tech Stack

| Layer          | Technology                                   | Why                                                             |
| -------------- | -------------------------------------------- | --------------------------------------------------------------- |
| **Frontend**   | React 19 + Vite + TypeScript                 | Fast, familiar, great dev experience                            |
| **Animation**  | Rive                                         | State machine, scalable, professional feel                      |
| **Backend**    | Node.js + Express + TypeScript               | Live FDD calculation, lean API                                  |
| **Database**   | SQLite                                       | Zero setup, portable, perfect for this data size (~50k records) |
| **Styling**    | Tailwind CSS                                 | Rapid design, utility-first, mobile-ready                       |
| **Deployment** | Vercel (frontend) + Railway/Render (backend) | Free tier, quick iteration                                      |

**Why not MongoDB?** SQLite is simpler here — no MongoDB setup, JSON compatibility, entirely self-contained. Perfect for a portfolio piece.

---

## 2. Data Strategy

### Source Files (3 SMHI Stations, Malmö Region)

| File   | Station   | Date Range              | Notes                       |
| ------ | --------- | ----------------------- | --------------------------- |
| File 1 | Station A | 1917-03-01 → 1964-05-31 | Oldest, longest history     |
| File 2 | Station B | 1926-06-01 → 1989-12-31 | Overlaps File 1 (1926–1964) |
| File 3 | Station C | 1990-01-01 → 2026-02-01 | Recent, most complete       |

**Merged result**: 1917-03-01 → 2026-02-01 (109 years)

**Overlaps**:

- 1926-06-01 to 1964-05-31: File 1 + File 2 → **Keep File 1** (longer continuous record)

**Scope**: Oct–May only (captures full freeze/thaw cycle)

### Data Cleaning & Merge

**Strategy:** Merge all 3 files into one master CSV, deduping the overlap period.

1. Load File 1 (1917-03-01 → 1964-05-31) entirely
2. Load File 2 (skip 1926-06-01 → 1964-05-31, keep only 1965-01-01 onward)
3. Load File 3 (1990-01-01 → 2026-02-01) entirely
4. Keep only `Y` and `G` quality records (skip `R`)
5. Sort by date ascending
6. Import single table: `weather_daily`

**Result:** One contiguous CSV, 1917-03-01 → 2026-02-01

```sql
CREATE TABLE IF NOT EXISTS weather_daily (
  date DATE PRIMARY KEY,
  temp_c REAL NOT NULL
);

CREATE INDEX idx_date ON weather_daily(date);
```

### Data Cleaning Script

- [ ] Write Node.js script to merge CSVs (or use a Python pandas one-liner)
- [ ] Validate no gaps > 5 days in Oct–May
- [ ] Export clean master CSV
- [ ] `sqlite3 < import.sql` to load

**Tool suggestion**: If you want help merging, I can write the script. Otherwise, a quick Node script with `fs` + `csv-parser` will do.

---

## 3. FDD Calculation (The Physics)

### What is FDD?

**Freezing Degree-Days (Net)**: Sum of all daily temperature changes below/above 0°C.

Ice thickness formula (empirical, Baltic coastal):
$$I = C \times \sqrt{\sum \text{Net FDD}}$$

Where:

- `I` = ice thickness in cm
- `C` ≈ 2.5 (conservative for Malmö, calm coastal water)
- `∑Net FDD` = daily accumulation where:
  - Negative temps: `fdd += |temp|` (ice accumulates)
  - Positive temps: `fdd -= temp` (ice melts, minimum 0)
  - Zero temp: no change

**Why "net" FDD?** Ice doesn't just accumulate—warm days actually melt it back. This is scientifically more honest and matches real physics.

### Cow Threshold

- Cow weight: ~400kg
- Load-bearing capacity of ice: ~4 kg/cm²
- Empirical studies: ~25cm of ice holds a 600kg cow
- At 400kg: **15cm minimum** (conservative, safe margin)

### Implementation: Backend

Create a **reusable calculator function**:

```typescript
// backend/utils/iceCalculator.ts

export interface IceResult {
  year: number;
  month: number;
  bestDate: Date;
  maxIceCm: number;
  holdsCow: boolean;
  fddAtPeak: number;
}

export function calculateNetFDD(temperatureArray: number[]): number {
  let fddSum = 0;
  for (const temp of temperatureArray) {
    if (temp < 0) {
      fddSum += Math.abs(temp); // Freeze: add
    } else if (temp > 0) {
      fddSum = Math.max(0, fddSum - temp); // Thaw: subtract (min 0)
    }
    // temp === 0: no change
  }
  return fddSum;
}

export function calculateIceThickness(fddSum: number): number {
  return 2.5 * Math.sqrt(fddSum);
}
```

### API Endpoint

```
GET /api/ice/:year/:month

Response:
{
  year: 1942,
  month: 2,
  bestDate: "1942-02-15",
  maxIceCm: 48.2,
  holdsCow: true,
  fddAtPeak: 368.4,
  message: "Tjock is! 48.2cm on Feb 15, 1942"
}
```

### Backend Logic

```typescript
// GET /api/ice/:year/:month
app.get("/api/ice/:year/:month", async (req, res) => {
  const { year, month } = req.params;
  const y = parseInt(year);
  const m = parseInt(month);

  // Get temp data from Oct (prior year) through end of selected month
  const startDate = new Date(y - 1, 9, 1); // Oct 1 prior year
  const endDate = new Date(y, m, 0); // Last day of selected month

  const allTemps = await db
    .select("date", "temp_c")
    .from("weather_daily")
    .whereBetween("date", [startDate, endDate])
    .orderBy("date");

  // Calculate daily ice thickness; track max during selected month
  let fddSum = 0;
  let maxIceCm = 0;
  let bestDate = null;
  let fddAtPeak = 0;

  const monthStart = new Date(y, m - 1, 1);
  const monthEnd = new Date(y, m, 0);

  for (const record of allTemps) {
    // Update net FDD
    if (record.temp_c < 0) {
      fddSum += Math.abs(record.temp_c);
    } else if (record.temp_c > 0) {
      fddSum = Math.max(0, fddSum - record.temp_c);
    }

    const iceCm = 2.5 * Math.sqrt(fddSum);

    // Track max ice during the selected month
    if (
      record.date >= monthStart &&
      record.date <= monthEnd &&
      iceCm > maxIceCm
    ) {
      maxIceCm = iceCm;
      bestDate = record.date;
      fddAtPeak = fddSum;
    }
  }

  const holdsCow = maxIceCm >= 15; // 15cm threshold for 400kg

  res.json({
    year: y,
    month: m,
    bestDate,
    maxIceCm: parseFloat(maxIceCm.toFixed(1)),
    holdsCow,
    fddAtPeak: parseFloat(fddAtPeak.toFixed(1)),
    message: holdsCow
      ? `Tjock is! ${maxIceCm.toFixed(1)}cm on ${bestDate.toLocaleDateString("sv-SE")}`
      : `Inte tjock nog. Max: ${maxIceCm.toFixed(1)}cm`,
  });
});
```

**Performance**: ~210 days per query (Oct–May) × simple math = <2ms.

---

## 4. Frontend Structure

### Two Input Modes (v1 = Mode 1 only)

#### Mode 1: Year + Month Dials (Initial Release)

User picks **year** and **month** (Oct–May only). The app returns the **thickest ice achieved on any day that month** and whether it could hold the cow.

- Year slider: **1917–2026**
- Month dropdown: Oct, Nov, Dec, Jan, Feb, Mar, Apr, May
- Button: "Test the ice"
- Trigger API call → get peak ice + result
- Display result in info panel

```
┌─────────────────────────────────┐
│  Ko på Isen                     │
│  ┌─────────────────────────────┐│
│  │  [Rive Cow Animation]       ││
│  │                             ││
│  └─────────────────────────────┘│
│                                 │
│  Year: 1942        ━━●━━        │
│  Month: [February ▼]            │
│                                 │
│  [ TEST THE ICE ]               │
│                                 │
│  ✅ Ice held steady!            │
│  Thickest in Feb: 48.2 cm       │
│  Date: Feb 15, 1942             │
│                                 │
└─────────────────────────────────┘
```

#### Mode 2: Peak Notch Slider (Future)

- Single horizontal slider with ~110 notches (one per peak freeze winter)
- SVG waveform track (bar height = ice thickness)
- Dashed line at 15cm threshold
- Blue → Red gradient (cold → warm)

---

## 5. Rive Animation States

| State            | Trigger                         | Visual                                         | Duration |
| ---------------- | ------------------------------- | ---------------------------------------------- | -------- |
| `idle_standing`  | `holdsCow: true`                | Cow standing, tail swaying, content expression | —        |
| `plunge`         | `holdsCow: false`               | Ice cracks, cow falls through (dramatic!)      | 1.5s     |
| `loading_jump`   | API fetching                    | Cow does a little jump, looking curious        | 0.8s     |
| `loading_sniff`  | API fetching                    | Cow sniffs the ice, tests it cautiously        | 0.6s     |
| `nervous_wobble` | `iceCm: 10–24` (rare, optional) | Cow wobbles on thin ice, taps hoof             | 1.2s     |

**Rive setup**: State machine with bool inputs:

- `holdsCow: boolean`
- `isLoading: boolean`
- Optional: `iceThin: boolean`

---

## 6. Component Structure (React)

```
src/
├── components/
│   ├── IceCalculator.tsx      (main page)
│   ├── RiveAnimation.tsx       (Rive cow embed)
│   ├── YearSlider.tsx          (range input)
│   ├── MonthSelect.tsx         (dropdown, Oct–Apr only)
│   ├── ResultDisplay.tsx       (info panel)
│   └── Button.tsx
├── hooks/
│   ├── useIceData.ts           (fetch hook)
├── services/
│   ├── api.ts                  (axios/fetch wrapper)
├── types/
│   └── ice.ts                  (IceResult interface)
├── App.tsx
└── main.tsx
```

---

## 7. Development Phases

## 7b. Backend Scaffolding Plan

**Directory structure:**

```
/backend/
  src/
    index.ts              (Express server entry)
    routes/
      ice.ts              (GET /api/ice/:year/:month)
    services/
      iceCalculator.ts    (FDD math + ice physics)
    utils/
      db.ts               (SQLite connection)
    types.ts              (TypeScript interfaces)
  package.json
  tsconfig.json
```

**What happens:**
- Express server exposes `/api/ice/:year/:month` endpoint
- On request, queries weather.db for all temps from Oct 1 (prior year) to last day of selected month
- Calculates net FDD (negatives add, positives subtract)
- Calculates ice thickness using Stefan's formula
- Checks if ice ≥ 15cm (Gold's rule)
- Returns JSON with all values needed for frontend and info modal

**API Response Example:**
```json
{
  "year": 1942,
  "month": 2,
  "bestDate": "1942-02-15",
  "maxIceCm": 48.2,
  "holdsCow": true,
  "fddAtPeak": 368.4,
  "freezeDays": 64,
  "thawDays": 3,
  "fddTotal": 327,
  "message": "Tjock is! 48.2cm on Feb 15, 1942"
}
```

**Next:** Scaffold backend, then connect frontend and modal.

---

### Phase 1: Data + Backend (Week 1)

- [ ] Merge 3 CSVs into clean master
- [ ] Create SQLite schema & import
- [ ] Write FDD calculator function
- [ ] Build `/api/ice/:year/:month` endpoint
- [ ] Test with manual API calls (Postman/curl)

### Phase 2: Frontend Shell (Week 2)

- [ ] React + Vite + Tailwind setup
- [ ] Year slider + Month dropdown (Oct–Apr locked)
- [ ] "Test the ice" button
- [ ] Fetch hook + API integration
- [ ] Result display (text only)

### Phase 3: Rive Animation (Week 2–3)

- [ ] Create/import cow character in Rive
- [ ] Design simple ice scene (blue platform, cracks)
- [ ] Implement state machine: standing/plunge/loading
- [ ] Integrate with API response

### Phase 4: Polish & Deploy (Week 3)

- [ ] Mobile responsive layout
- [ ] Default opening state (best date: Feb 1942 or Jan 1963?)
- [ ] Accessibility (aria labels, keyboard nav)
- [ ] Error handling (network, bad params)
- [ ] Deploy to Vercel + Railway
- [ ] README + GitHub setup

### Phase 5: Mode 2 Slider (Stretch Goal)

- [ ] Precompute all winter peaks from data
- [ ] Custom SVG slider with notches
- [ ] Gradient track

---

## 8. Key Decisions (Locked)

| Question            | Decision                      | Reasoning                                                  |
| ------------------- | ----------------------------- | ---------------------------------------------------------- |
| Pre-calculate FDD?  | **No** — live calculation     | Shows fullstack depth, scientific integrity                |
| Where to calculate? | **Backend (Node.js)**         | Server-side logic, single source of truth, API reusability |
| Database            | **SQLite**                    | Self-contained, zero setup, perfect data size              |
| Cow weight          | **400kg** (user-configurable) | Realistic, simpler threshold math                          |
| Ice threshold       | **15cm**                      | Conservative for 400kg load                                |
| Data range          | **Oct–May**                   | Full freeze/thaw cycle                                     |
| Animation library   | **Rive**                      | Professional, state machine, scalable                      |

---

## 9. Data: CSV Format & Import Notes

### SMHI CSV Structure

Your CSVs have this format:

- **Representativt dygn** = the actual date (yyyy-mm-dd)
- **Lufttemperatur** = average daily temperature in Celsius
- **Kvalitet** = quality code:
  - `G` = verified & approved (best)
  - `Y` = suspected or aggregated (acceptable)
  - `R` = rejected (skip these)

### Data Cleaning

When merging the 3 CSVs:

1. Parse only `Y` and `G` quality records
2. Skip `R` (rejected)
3. For date overlaps between stations, keep the record from the station with higher overall completeness, or average them
4. Sort final data by date ascending
5. Check for gaps > 5 days in Oct–May range

### Import Script (Node.js)

```typescript
// scripts/importWeatherData.ts

import fs from "fs";
import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./weather.db");

// Merge strategy: File1 (entire) + File2 (from 1965 onward) + File3 (entire)
const weatherData = new Map(); // date -> tempC

function parseCSV(filePath: string, skipUntilDate?: string) {
  const lines = fs.readFileSync(filePath, "utf-8").split("\n");
  let skipMode = skipUntilDate ? true : false;

  for (const line of lines) {
    if (!line.trim()) continue;

    const parts = line.split(";");
    if (parts.length < 5) continue; // Skip metadata rows

    const date = parts[2]?.trim(); // Representativt dygn
    const temp = parseFloat(parts[3]?.trim() || "NaN");
    const quality = parts[4]?.trim();

    // Skip invalid or rejected records
    if (!date || isNaN(temp) || quality === "R") continue;

    // Only keep G (approved) or Y (acceptable) quality
    if (quality !== "G" && quality !== "Y") continue;

    // Skip-until logic for File 2 overlap
    if (skipMode && date >= skipUntilDate) {
      skipMode = false;
    }
    if (skipMode) continue;

    // Store (only keep first occurrence per date)
    if (!weatherData.has(date)) {
      weatherData.set(date, temp);
    }
  }
}

// Parse all 3 files
parseCSV("file1_1917-1964.csv"); // Entire
parseCSV("file2_1926-1989.csv", "1965-01-01"); // Skip until 1965
parseCSV("file3_1990-2026.csv"); // Entire

// Create table
db.run(`
  CREATE TABLE IF NOT EXISTS weather_daily (
    date DATE PRIMARY KEY,
    temp_c REAL NOT NULL
  )
`);

// Insert sorted data
const sortedDates = Array.from(weatherData.keys()).sort();
const stmt = db.prepare(
  "INSERT INTO weather_daily (date, temp_c) VALUES (?, ?)",
);

for (const date of sortedDates) {
  stmt.run(date, weatherData.get(date));
}

stmt.finalize();
db.close();
console.log(`Imported ${weatherData.size} days (1917-03-01 to 2026-02-01)`);
```

---

## 10. Data Ready ✅

- **Date range**: 1917-03-01 → 2026-02-01 (109 years)
- **Format**: All 3 files semicolon-delimited, identical structure
- **Next**: Merge the 3 CSVs into one master file, import to SQLite

---

## 11. Open Questions / TODO

- [ ] Default opening state? (Best case: Feb 1942 at 54cm ice? Or dramatic: Jan 1963 = last possible?)
- [ ] Should cow weight be a user-adjustable slider? (Nice-to-have)
- [ ] Rive subscription cost? (Check if free tier covers this)
- [ ] Easter egg: Show climate data story? ("Last possible cow: Jan 1963")

---

## 10. Why This Works for Your CV

✅ **Full stack**: React → Node → SQLite → Rive  
✅ **Real data**: 1917–2017 Malmö weather  
✅ **Physics calculation**: Legit FDD algorithm  
✅ **Animation layer**: Increasingly valuable skill  
✅ **Unique & shareable**: "Does a cow survive on Malmö ice in [year]?"  
✅ **Data story**: Climate visible in 100 years of temperature  
✅ **Polish**: Professional design + humor

---

## Next Steps

1. Confirm data merging strategy (which station for overlaps?)
2. Write CSV merge script
3. Start Phase 1 backend
4. Share Rive file when ready

---

**Last updated**: May 9, 2026
