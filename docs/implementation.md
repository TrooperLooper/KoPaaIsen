# Implementering i stacken: Från Data till UI

## Backend-logik: Kalkylen som motor

På backendnivå (Express + TypeScript) gör vi följande **varje gång användaren frågar**:

1. **Hämta väderdata från SQLite** — alla dagar från 1 oktober (året innan) till slutet av vald månad
2. **Iterera genom temperaturer** och bygga upp FDD-summan dag för dag:

   ```typescript
   for (const row of allTemps) {
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

3. **Jämför slutresultatet med Golds formel**:
   ```typescript
   const holdsCow = maxIceCm >= COW_THRESHOLD_CM; // 11 cm minimum
   ```

**Logiken här:** Istjockleken är inte monotonisk, den kan minska när det blir varmare. Därför spårar vi den maximala istjockleken och när den uppnåddes (fddAtPeak).

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
SQLite (39 000+ dagsobservationer)
    ↓
Backend API: `/api/ice/:year/:month`
    ↓ (FDD-kalkyl + Stefan + Gold)
JSON-svar: { maxIceCm, holdsCow, freezeDays, thawDays, fddAtPeak }
    ↓
React hooks (`useIceData`) hämtar och cachas
    ↓
Komponenter renderar animering + modal
    ↓
Användaren ser: En ko som antingen står på isen eller plumsar
```

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind + Rive (animation)
- **Backend:** Express + TypeScript
- **Database:** Turso (LibSQL cloud database)
- **Data:** 39,000+ dagsobservationer från SMHI (1917–2026)
