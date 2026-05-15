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

Systemet skickar tillbaka:

- `maxIceCm` — den tjockaste isen under perioden
- `holdsCow` — sant/falskt baserat på Gold-gränsen
- `freezeDays`, `thawDays`, `fddAtPeak` — detaljer för användarens förståelse

I React-appen:

1. **CowAnimation** byter tillstånd baserat på `holdsCow`
   - `holdsCow === true` → kons modell står stabilt på isen (Rive-animation "stand")
   - `holdsCow === false` → kons modell sjunker genom isen (Rive-animation "plunge")

2. **IceInfo** modal visar siffrorna på ett lättläst sätt:
   - "Tjockaste isen: 44,8 cm"
   - "Resultat: Kon klarar sig! ✓"

3. **CalculationModal** förklarar (på svenska) exakt varför resultatet blev så:
   - Hur många frysdagar det var
   - Hur Stefan-formeln applicerades
   - Varför 11 cm är gränsen för Golds regel

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

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind + Rive (animation) + Zod (runtime-validering)
- **Backend:** Express + TypeScript + Zod (runtime-validering) + Jest (enhetstester)
- **Database:** Turso (LibSQL cloud database)
- **Data:** 39 000+ dagsobservationer från SMHI (1917–2026)
