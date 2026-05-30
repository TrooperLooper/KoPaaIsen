# Fysiken bakom (FDD & Istjocklek)

## Begreppslogik: Från väderdata till säker is

Det här projektet visar hur man transformerar rå väderdata till en fysikalisk modell. Tanken är simpel: **is växer när det frysande väder länge, och smälter snabbt när värmen kommer.** Vi behöver mäta denna process korrekt.

## Frysgradsdagar (FDD) — Kärnkonceptet

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

## Stefans istillväxtformel — Hur tjock blir isen?

I slutet av 1800-talet löste fysikern Josef Stefan en värmeekvation för hur tjock en isfilm blir under kontinuerlig frysning. Formeln är välkänd inom glaciologi:

$$I = C \times \sqrt{\sum \text{Net FDD}}$$

**På begriplig svenska:**
Tjockare is växer långsammare. Om vi har dubbelt så många frysgrader blir isen inte dubbelt tjock—bara √2 gånger tjockare. Det är därför √ är där.

**Tekniskt:**

- `I` = istjocklek (cm)
- `C` = 2.5 (empiriskt värde för Öresund, baserat på historiska observationer)
- `√(Net FDD)` = kvadratroten av den kumulativa frysintensiteten
- Konstanten `C` är regionspecifik; andra platser har andra värden beroende på vind, snötäcke, vattnets salthalt

## Golds bärformel — Kan isen bära en ko?

Lastbärighetens fysik är enkel: **Trycket på isen måste vara mindre än isens styrka.**

**På begriplig svenska:**
En ko på 400 kg på isen, hur tjock måste isen vara för att inte gå sönder? Vi behöver beräkna kraft per areal och jämföra det med isens bärförmåga.

**Tekniskt:**

Vi antar en normal kos totala kontaktyta (~100 cm², baserat på 4 ben à ~25 cm² vardera):

```
Tryck per cm² = vikt / kontaktarea
Istyrka per cm² ≈ 3.5 kg/cm² (empirisk gräns för saltvatten/Öresund)

För 400 kg: 400 kg / 3.5 kg/cm² = 114.3 cm²
Kons totala kontaktarea: ~100 cm² → passa precis.
Minimum istjocklek för säkerhet: ~11 cm
```

Denna gräns är välkänd från sjöis-tabeller och glaciärdokumentation.
