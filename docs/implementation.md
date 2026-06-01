# Implementering i stacken: Från Data till UI

## Backend-logik: Kalkylen som motor

Backend-lagret är uppdelat i två separata ansvarsområden:

### 1. Datahämtning och validering (`services/iceCalculator.ts`)

Hämtar väderdata från Turso, validerar varje databasrad med Zod, och skickar vidare till fysikfunktionen:

```typescript
const result = await db.execute({ sql: `SELECT date, temp_c FROM weather_daily WHERE ...`, args: [...] });
const rows = WeatherRowsSchema.parse(result.rows); // kastar ZodError om data är felformad
return calculateIceFromTemperatures(rows, monthStart, monthEnd, year, month);
```

### 2. Fysikberäkning (`utils/icePhysics.ts`)

En **ren funktion** — ingen databas, inget nätverk, bara matematik. Kan testas isolerat med vilken indata som helst:

```typescript
for (const row of rows) {
  const temp = row.temp_c;
  if (temp < 0) {
    fddSum += Math.abs(temp);
    freezeDays++;
  } else if (temp > 0) {
    fddSum = Math.max(0, fddSum - temp); // Aldrig negativ
    thawDays++;
  }

  // Stefan-formeln, uppdaterad varje dag för att hitta max
  const iceCm = STEFAN_CONSTANT * Math.sqrt(fddSum);
  if (iceCm > maxIceCm) {
    maxIceCm = iceCm;
    fddAtPeak = fddSum;
  }
}
```

**Logiken här:** Istjockleken är inte monotonisk — den kan minska när det töar. Därför spårar vi den maximala istjockleken och när den uppnåddes (`fddAtPeak`). Separationen gör det möjligt att enhetstesta fysiken utan en databaskoppling.

**Jämför med Gold:**

```typescript
const holdsCow = maxIceCm >= COW_THRESHOLD_CM; // 11 cm minimum
```

## Frontend-rendering: Resultatet blir visuellt

Delade konstanter och hjälpfunktioner lever i egna moduler:

- `constants/months.ts` — `MONTH_NAMES` och `MONTHS` (Oct–Maj), importeras av alla komponenter som behöver månadsnamn
- `utils/canvasMetrics.ts` — beräknar canvas-dimensioner utifrån fönsterbredd; `IceApp` anropar `calculateCanvasMetrics(windowWidth)` istället för att ha inline-matte

Systemet skickar tillbaka:

- `maxIceCm` — den tjockaste isen under perioden
- `holdsCow` — sant/falskt baserat på Gold-gränsen
- `freezeDays`, `thawDays`, `fddAtPeak` — detaljer för användarens förståelse

I React-appen:

1. **CowAnimation** byter tillstånd baserat på `holdsCow`
   - `holdsCow === true` → kons modell står stabilt på isen (Rive-animation "stand")
   - `holdsCow === false` → kons modell sjunker genom isen (Rive-animation "plunge")

2. **IceInfo** modal visar siffrorna på ett lättläst sätt:
   - "I {månad} {år} var isen {tjocklek} cm."
   - Klickbar info-knapp som öppnar **CalculationModal**

3. **CalculationModal** — transparensen bakom kulisserna
   - Visar Golds formel: "Varför behövs 11 cm?"
   - Visar Stefans formel: "Hur tjock blev isen verkligen?"
   - Kombinerar matematiken för att förklara resultatet
   - Exempel: "Från oktober 1941 till februari 1942 var det 64 frysdagar (-327 grader totalt). Stefan-formeln ger 48.2 cm. Gold's regel kräver 11 cm. Resultat: Kon klarar sig! ✓"

Det är inte bara en siffra — det är en förklaring en användare kan förstå och verifiera själv.

## Error Handling & Validering

Fel kan hända på flera ställen. Vi fångar dem utan att krascha:

**Database → Backend:**
Zod validerar varje rad från Turso. Om en rad saknar `temp_c`, kastar Zod `ZodError` → routens `catch` fångar det → logg via Winston → 500-respons med detalj.

**Route → Frontend:**
Routens `try/catch` fångar alla fel (databas, fysik, det okända). Loggade via Winston. API returnerar alltid JSON med `error` och `details` fält.

**Frontend API-anrop → Component:**
`fetchIceData()` validerar svaret med Zod innan det når React-staten. Fel → `useIceData` hanterar → visar error modal för användaren.

**Rate Limiting:**
`express-rate-limit` på `/api/ice` — max 60 req/min per IP. Överskridens → 429 respons + message.

**CORS:**
Origo matchas mot `ALLOWED_ORIGINS` (miljövariabel). Mismatch → logger.warn → 403 implicit (ingen Access-Control-Allow-Origin header).

## Dataintegration: Full stack pipeline

```
Turso (39 000+ dagsobservationer)
    ↓
Backend API: GET /api/ice?year=:year&month=:month
    ↓ (Zod-validering → FDD-kalkyl → Stefan → Gold)
JSON-svar: { maxIceCm, holdsCow, freezeDays, thawDays, fddAtPeak }
    ↓
Frontend Zod-validering av API-svaret
    ↓
React hooks (useIceData) hämtar och cachas
    ↓
Komponenter renderar animering + modal
    ↓
Användaren ser: En ko som antingen står på isen eller plumsar
```

### Arkitektoniskt val — on-demand vs. förberäkning

Beräkningarna körs on-demand per API-anrop snarare än att vara förberäknade. I ett produktionssystem hade man vänt på detta: förberäknat alla år/månads-kombinationer (1 387 st) och cachat dem i databasen eller som statisk JSON — ingen backend alls. Det on-demand alternativet som jag valde medvetet var för att bevisa en riktig backend-pipeline och hålla hela stacken synlig, på bekostnad av en liten fördröjning per anrop.

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind + Rive (animation) + Zod (runtime-validering)
- **Backend:** Express + TypeScript + Zod (runtime-validering) + Winston (logging) + Jest (enhetstester)
- **Säkerhet:** CORS origin-whitelist, express-rate-limit (60 req/min per IP)
- **Database:** Turso (LibSQL cloud database)
- **CI/CD:** GitHub Actions (test suite on push, scheduled deployment health check)
- **Data:** 39 000+ dagsobservationer från SMHI (1917–2026)
