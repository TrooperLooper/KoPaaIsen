# Ko på Isen

**En "fullstack-pocket-app" som svarar på frågan: Kan en ko stå på isen i någon av Malmös historiska vintrar?**

---

## Idé & Syfte

En animerad ko på isen i Malmö hamn. Användaren väljer år och månad (vinterhalvåret), trycker på "Testa isen" och får se om isen håller för en vuxen ko (400 kg) — eller om kon plumsar igenom. Allt bygger på historiska SMHI väderdata och fysikaliska formler.

---

## Datakälla

- SMHI:s dagliga temperaturdata för Malmö, 1917–2026
- Tre väderstationer, sammanslagna och deduplicerade
- Data lagras i SQLite för snabb hämtning

---

## Fysiken bakom (FDD & Istjocklek)

### Frysgradsdagar (FDD)

- Varje dag med minusgrader adderas till FDD (t.ex. -5°C = +5 FDD)
- Varje dag med plusgrader subtraheras (t.ex. +2°C = -2 FDD, men aldrig under 0)
- FDD summeras från 1 oktober (föregående år) till vald månad

### Stefans istillväxtformel

$$I = C \times \sqrt{\sum \text{Net FDD}}$$

- `I` = istjocklek i cm
- `C` = 2.5 (fast empiriskt värde för Öresunds kust)
- `∑Net FDD` = ackumulerade frysgrader (minus upptiningsdagar)

### Golds bärformel

- En ko på 400 kg kräver minst 15 cm kärnis för att stå säkert
- (4 kg/cm² bärighet, empiriskt)

---

## Exempelberäkning (Februari 1942)

**Vad hände?**

Från oktober 1941 till februari 1942 var det 64 frysdagar (totalt -327 grader). Tre dagar var det över 0°C, så isen smälte tillbaka lite.

**Beräkning:**

- FDD: |−2| + |−5| + ... − 1 − 0.5 ... = 327 − 5 = 322
- Stefans: 2.5 × √322 = 2.5 × 17.94 = 44.8 cm
- Golds: 400 kg / 4 kg/cm² = 100 cm² → 15 cm min

```javascript
// Gold's rule: 15 cm is safe
result = iceThickness >= 15 ? "Safe for cow" : "Ice breaks";
```

**Resultat:**

- Istjocklek: 44.8 cm
- Ko klarar sig?: True

---

## Komponenter & Arkitektur

- **Frontend:** React + Vite + TypeScript + Tailwind
- **Animation:** Rive (statemaskin: stående, plums, laddar)
- **Backend:** Node.js + Express + TypeScript
- **Databas:** SQLite (39 000+ dagar, 1917–2026)

### API

- `/api/ice/:year/:month` — returnerar tjockaste isen för vald månad, samt om kon klarar sig

---

## InfoModal (för användaren)

Kort, logisk förklaring:

> För att isen ska bära en vuxen ko på 400 kg krävs minst 15 cm tjock is (Golds bärformel).
>
> Från oktober 1941 till februari 1942 var det 64 frysdagar (totalt -327 grader). 3 dagar var det över 0°C, så isen smälte tillbaka lite.
>
> Enligt Stefans istillväxtformel var tjockaste isen i februari: 48.2 cm.
>
> Golds: 400 kg / 4 kg/cm² = 100 cm² → 15 cm min
> Stefan: 2.5 × √322 = 48.2 cm
>
> // Gold's rule: 15 cm is safe
> result = iceThickness >= 15 ? "Safe for cow" : "Ice breaks";

---

## Utvecklarens tankegång

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
5. Polish & deploy

---

**Varför gjorde jag detta projekt?**

- För att demonstrera mitt kreativa sätt att arbeta med fullstack, data, fysik, UX, animation, och exempel på hur jag kommunicerar komplex data logiskt, roligt och enkelt sätt.

---

**Lars, 2026**
