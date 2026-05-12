# ![Ko på Isen](frontend/public/kopaaisen_github.png)

**En fullstack-applikation som kombinerar historiska väderdata, vetenskaplig fysik och interaktiv animering för att svara på en rolig (men komplex) fråga: Kan en ko stå på isen i någon av Malmös historiska vintrar?**

[🚀 Live Demo](https://kopaaisen.vercel.app) | [📖 GitHub](https://github.com/TrooperLooper/KoPaaIsen)

_Jag ville med detta projekt visa fram hur jag designar, implementerar och förklarar ett komplett datadrivet system från rådata av en databas till en levande interaktiv infografik._

---

## Idé & Syfte

Användaren väljer år och månad (vinterhalvåret), trycker på "Testa isen" och får omedelbar visuell och engagerande feedback:

- **Om isen är tillräckligt tjock:** Kon står stabilt på isen (den animerade kossan är glad)
- **Om isen är för tunn:** Kon plumsar igenom (den animerade kossan plumsar förskräckt genom isen)

Allt bygger på:

1. **Historiska data** CSV filer från SMHI (39 381 dagsobservationer, tre väderstationer, fr. 1917–2026)
2. **Vetenskaplig modellering** (Stefan-formeln för istjocklek, Golds regel för bärighet)
3. **Backend-kalkyl** (FDD-ackumulering, validering)
4. **Frontend-visualisering** (React, Rive-animation, responsiv design)

---

## Datakälla

- SMHI:s historiska temperaturdata för Malmö hamn, 1917–2026
- Tre väderstationer, sammanslagna och deduplicerade
- Data lagras i SQLite för snabb hämtning

---

## Fysiken bakom (FDD & Istjocklek)

### Begreppslogik: Från väderdata till säker is

Det här projektet visar hur man transformerar rå väderdata till en fysikalisk modell. Tanken är simpel: **is växer när det frysande väder länge, och smälter snabbt när värmen kommer.** Vi behöver mäta denna process korrekt.

#### Frysgradsdagar (FDD) — Kärnkonceptet

Istjocklek beror inte bara på en enda kallnatt. Det är den **kumulativa effekten** av lång kyla som räknas. Därför använder vi Frysgradsdagar (Freezing Degree Days).

**På begriplig svenska:**
Varje dag som är kallare än 0°C bidrar till istjockleken. En dag på −5°C är "värre" än en dag på −1°C. En dag på +5°C smälter många frysgrader bort igen.

**Tekniskt:**

```
FDD(dag) = |temperatur| if temperatur < 0, else 0
Net FDD = ∑(FDD från okt) − ∑(varmedagar från okt)
```

- Från **1 oktober** började vi räkna (höstens start, vattnets första kylning)
- Varje dag med minusgrader adderas: -5°C → +5 FDD
- Varje dag med plusgrader minskar: +2°C → −2 FDD (men aldrig under 0, isen kan inte bli "mindre tjock" än ingenting)
- Slutresultatet är ett tal som representerar **netto frysintensitet** över en période

#### Stefans istillväxtformel — Hur tjock blir isen?

I slutet av 1800-talet löste fysikern Josef Stefan en värmeekvation för hur tjock en isfilm blir under kontinuerlig frysning. Formeln är välkänd inom glaciologi:

$$I = C \times \sqrt{\sum \text{Net FDD}}$$

**På begriplig svenska:**
Tjockare is växer långsammare. Om vi har dubbelt så många frysgrader blir isen inte dubbelt tjock—bara √2 gånger tjockare. Det är därför √ är där.

**Tekniskt:**

- `I` = istjocklek (cm)
- `C` = 2.5 (empiriskt värde för Öresund, baserat på historiska observationer)
- `√(Net FDD)` = kvadratroten av den kumulativa frysintensiteten
- Konstanten `C` är regionspecifik; andra platser har andra värden beroende på vind, snötäcke, vattnets salthalt

#### Golds bärformel — Kan isen bära en ko?

Lastbärighetens fysik är enkel: **Trycket på isen måste vara mindre än isens styrka.**

**På begriplig svenska:**
En ko på 400 kg på isen, hur tjock måste isen vara för att inte gå sönder?
kraft per areal och jämföra det med isens bärförmåga.

**Tekniskt:**

```
Tryck per cm² = vikt / kontaktarea
Istyrka per cm² ≈ 3.5 kg/cm² (empirisk gräns för saltvatten/Öresund)

För 400 kg: 400 kg / 3.5 kg/cm² = 114.3 cm²
Om varje ben är ~25 cm², passar 4 ben.
Minimum istjocklek för säkerhet: ~11 cm
```

Denna gräns är välkänd från sjöis-tabeller och glaciärdokumentation.

---

## Implementering i stacken: Från Data till UI

### Backend-logik: Kalkylen som motor

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

### Frontend-rendering: Resultatet blir visuellt

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

### Dataintegration: Full stack pipeline

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

---

## Exempelberäkning: Februari 1942 (ett verkligt fall)

**Historisk kontext:**
Vintern 1941–1942 var en av de kallaste under 1900-talet i Sverige. Vi tittar på vad som hände från oktober 1941 till februari 1942.

**Vad vi hade:**

- Från 1 oktober 1941 → 29 februari 1942 = ~152 dagar
- 64 dagar med temperatur < 0°C (kalla vinterdagar)
- 3 dagar med temperatur > 0°C (korta upptiningar)
- Resten omkring 0°C (övergångsdagar)

**Steg-för-steg-beräkning:**

1. **FDD-ackumuleringen** (förenklad):

   ```
   Frysgrader: |−2| + |−5| + |−8| + ... = 327 (summa)
   Varmefrysning: 1 + 0.5 + 0.3 + ... = 5 (summa)
   Net FDD = 327 − 5 = 322
   ```

2. **Stefans formel**:

   ```
   I = 2.5 × √322
   I = 2.5 × 17.94
   I ≈ 44.8 cm
   ```

3. **Golds formel**:
   ```
   11 cm gräns för 400 kg ko
   Faktisk tjocklek: 44.8 cm
   Resultat: 44.8 > 11 → KON KLARAR SIG ✓
   ```

**Varför detta exempel är intressant:**
Februari 1942 var **inte** en extremt kall månad för sig själv. Men den kom _efter_ en hel kallperiod från oktober. Det visar varför vi räknar Net FDD från oktober—det är den kumulativa effekten som skapar tjock is, inte en enstaka kall dag.

**Validering mot verklighet:**
Malmö hamn hade faktiskt tjock is vinterarna under 1940-talet. Denna beräkning matchar historiska observationer från SMHI och lokala arkiv.

---

## Utvecklarens tankegång: Varför denna arkitektur?

### 1. **Datadrivet designtänkande**

Jag började med **frågan**: "Vad behövs för att svara på om isen håller för en ko ?" och sen arbetade bakåt:

- Väderdata? ✓ Finns hos SMHI (1917–2026)
- Vetenskaplig modell? ✓ Stefan-formeln är väletablerad
- Säkerhetsgräns? ✓ Golds regel är dokumenterad

Allt är baserat på **verifierbara fakta**, inte "hittepå."

### 2. **Separation front/backend**

Backend och frontend är helt åtskilda:

- **Backend** vet bara om matematik och databas—ingen UI-logik
- **Frontend** vet bara om rendering—ingen fysik-logik
- De pratar via ett enkelt JSON API

Denna separation gör koden testbar, skalbar och lätt att förstå.

### 3. **Transparens i komplexitet**

En användare kan tro att beräkningen är "svart lådor-magi." Jag löste det genom:

- **CalculationModal**: Visar exakt hur beräkningen gick till
- **Kod i repot**: Varje konstant är motiverad (STEFAN_CONSTANT = 2.5, COW_THRESHOLD_CM = 11)
- **README**: Förklarar både vardagligt och tekniskt

### 4. **Performance-thinking**

Jag jobbar vanligtvis i MongoDB och SQL. 39 000+ databadrader skulle kunna vara långsamt. Lösningen:

- SQLite-indexering på `date`
- Backend cachar inte (varje API-call är oberoende)
- Frontend cachar resultatet tills användaren ändrar år/månad

### 5. **UX via animation**

Rive-animationen är väldigt lätt att avläsa och **kommunicerar effektivt** komplex information:

- Kon står = "isen höll" (positivt, visuellt)
- Kon sjunker = "isen bröt" (negativt, omedelbar förståelse)

En siffra "13.8 cm" säger mindre än att _se_ en glad ko på stabil is.

---

## Komponenter & Arkitektur

- **Frontend:** React + Vite + TypeScript + Tailwind
- **Animation:** Rive (statemachine: stående, plums, idle animationer)
- **Backend:** Node.js + Express + TypeScript
- **Databas:** SQLite (39 000+ dagar, 1917–2026)

### API

- `/api/ice/:year/:month` — returnerar tjockaste isen för vald månad, samt om kon klarar sig

---

## Vad jag lärde mig och vad som var tufft

**Rive State Machine & Data Binding**
Integreringen av Rive var initialt logisk, men ordningen på data binding var knepig. Jag testade flera states (`holdsCow`, `isLoading`, `cow_anticipation`), men insåg att `hasResult` som en enda boolean löste allt — mindre komplexitet, bättre animationskontroll.
Rive känns väldigt bekant, som det gamla Flash.

**FDD-logik & Backend-design**
Jag ville först beräkna FDD i frontend, men när jag tänkte på hur väder inte bara fryser men också töar på vintern läste jag på mer om Stefan-formeln insåg jag att det hörde hemma i backend — där jag redan hade all historisk data. Det blev både renare och mer korrekt. **Lärdom:** Förstå varförnågot fungerar på riktigt, inte bara som modell.

**Datahantering — SQLite över Excel**
Med 39 000+ temperaturrader från tre olika SMHI-stationer krashade Excel. SQLite blev räddningen — och en bra påminnelse om att välja verktyg efter problem, inte vana. Som MERN-dev var det också värdefullt att träna mer på SQL.

---

## InfoModal (för användaren)

Kort, logisk förklaring:

> För att isen ska bära en vuxen ko på 400 kg krävs minst 11 cm tjock is (Golds bärformel).
>
> Från oktober 1941 till februari 1942 var det 64 frysdagar (totalt -327 grader). 3 dagar var det över 0°C, så isen smälte tillbaka lite.
>
> Enligt Stefans istillväxtformel var tjockaste isen i februari: 48.2 cm.
>
> Golds: 400 kg / 3.5 kg/cm² = 114.3 cm² → 11 cm min
> Stefan: 2.5 × √322 = 48.2 cm
>
> // Gold's rule: 11 cm is safe
> result = iceThickness >= 11 ? "Safe for cow" : "Ice breaks";

---

## Hur jag tänkte som utvecklare

- **Datadrivet:** Allt bygger på verkliga SMHI-data, ingen "hittepå".
- **Fysikaliskt korrekt:** FDD och istillväxt enligt vetenskapliga modeller.
- **Logiskt:** Tydlig separation av konstanter och variabler, kod och matematik.
- **Pedagogiskt:** Förklarar både för användare och utvecklare hur allt hänger ihop.
- **Fullstack:** Från databas till animation.

---

## Roadmap

1. Datamerge & import av CSV filer (klart)
2. Backend-API med FDD-logik
3. Frontend med React + Rive
4. InfoModal-komponent
5. Finputsning, README.md & deploy

---

## Varför gjorde jag detta projekt?

Jag ville visa att jag kan:

✓ **Förstå domän-specifik kunskap** — Kan plugga in fysik i kod utan att det blir "hittepå"  
✓ **Designa logiskt** — Från data till användarupplevelse, varje steg känns motiverat  
✓ **Implementera fullstack** — SQLite → Backend API → Frontend UI → Animation, end-to-end  
✓ **Kommunicera komplexitet** — Visa både "vad" och "varför" för både folk som gillar att se komplex data bli visualiserad med hög nivå av visuell kommunikation & designkvalitet.  
✓ **Tänka i system** — Inte bara prata om systemer utan göra det förståeligt och underhållbart.
✓ **Matcha mot verklighet** — Resultaten matchar historiska väderdata och fysikaliska gränser

Det här är min sätt att säga: **Jag älskar när kod, design och kontext går hand i hand.**

---

**Lars Munck, 2026**
