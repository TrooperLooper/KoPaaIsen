# Ko på Isen — Intervjudrill

> **Hur du använder det här:** Läs frågan. Svara högt utan att titta på svaret. Kolla sedan. Om du kunde det — bocka av det mentalt. Om inte — läs, vänta en dag, prova igen.

---

## 🟦 Block 1 — Vad är projektet? (30 sekunder max)

**Q: Förklara Ko på Isen på 30 sekunder.**

> Det är en fullstack-app som svarar på frågan: kunde en ko stå på isen i Malmö under ett visst historiskt år och månad? Du väljer år och månad, klickar på en knapp, och ser en animerad ko antingen stå stabilt eller plumsa igenom isen. Bakom det ligger 100 år SMHI-väderdata, en fysikformel för istjocklek och Golds regel för bärighet.

---

**Q: Varför just den här idén?**

> Jag ville bygga något datadrivet och vetenskapligt korrekt — men också roligt. Frågan "kunde en ko stå på isen?" är tillräckligt absurd för att väcka intresse, men den har ett riktigt svar. Det tvingade mig att förstå domänen på riktigt, inte bara bygga ett CRUD-formulär.

---

## 🟦 Block 2 — Fysiken (måste kunna detta)

**Q: Vad är FDD?**

> Freezing Degree Days — kumulativ kyla. Varje dag med minusgrader adderas (absolut värde). Plusgrader subtraherar. Det mäter total kylaenergi över tid, inte enstaka kallnätter. Det är FDD som avgör hur tjock isen faktiskt blir.

---

**Q: Vad är Stefan-formeln?**

> `I = C × √FDD` — istjockleken i cm är Stefan-konstanten (2.5 för saltvatten) gånger roten ur FDD. Det är en klassisk fysikformel från 1800-talet som modellerar istillväxt.

---

**Q: Vad är Golds regel?**

> En bärförmåga-formel: `P = A × H²`. P är vikten (400 kg för en ko), A är isens bärförmåga per cm² (3.5 för saltvatten). Löser du för H får du ~11 cm som minimum för att isen ska hålla.

---

**Q: Varför 11 cm just?**

> Det är matematiken: 400 / 3.5 = 114.3, √114.3 ≈ 10.7 cm. Avrundat uppåt: 11 cm. Det är inte godtyckligt — det är Gold's regel applicerat på en 400 kg ko på Malmös bräckta/salta vatten.

---

## 🟦 Block 3 — Arkitektur & Tekniska val

**Q: Varför beräknar du FDD i backend och inte frontend?**

> Frontenden vet ingenting om fysik — det är backends ansvar. All historisk väderdata bor i databasen, backenden har direkt access. Att flytta den logiken till frontend hade betytt att antingen skicka 39 000 rader data till klienten, eller duplicera logik på fel ställe. Det naturliga hemmet för domänlogik är backenden.

---

**Q: Varför kör du on-demand beräkning istället för att förberäkna allt?**

> Medvetet val för demonstration. I produktion hade man förberäknat alla ~1 400 år/månad-kombinationer och cachat dem — ingen backend i critical path. Men här ville jag visa hela stacken levande: databas → beräkning → API → frontend. Det är ett trade-off mellan transparens och prestanda, och jag valde transparens för att visa att pipelinen faktiskt fungerar.

---

**Q: Varför SQLite/Turso istället för MongoDB?**

> Data är strikt tabellformat: datum + temperatur. Ingen anledning till ett dokumentdatabas för det. SQLite är extremt snabbt för läsning, indexeringen på `date` gör lookups nästan omedelbara. Det var också en medveten övning — jag är van vid MongoDB, men SQL är grundläggande och det var värdefullt att använda det på riktigt.

---

**Q: Varför Zod på både frontend och backend?**

> Zod validerar vid runtime — TypeScript är bara compile-time. Backend validerar varje databasrad när den hämtas, så om datan är felformad kraschar appen kontrollerat med ett tydligt felmeddelande istället för att skicka korrupt data vidare. Frontend validerar API-svaret på samma sätt — ingen komponent får se ovaliderad data.

---

**Q: Varför Winston för loggning?**

> Strukturerad loggning — JSON-format som går att söka i och parsa programmatiskt. Jämfört med `console.log` ger Winston levels (info, warn, error), metadata och möjlighet att skicka till en log-tjänst i produktion utan att ändra koden.

---

**Q: Varför Rive för animationen?**

> Rive har en state machine som man kan kontrollera med kod. Jag skickar en boolean (`holdsCow`) och Rive byter tillstånd — kon plumsar eller står. Det är rent: animationslogiken lever i Rive-filen, inte i React-koden. Det hade blivit komplext att hantera det i CSS eller Framer Motion.

---

## 🟦 Block 4 — Frontend-arkitektur

**Q: Hur är frontend uppdelad?**

> IceApp är orchestratorn — den håller state och triggar animationer. Dials hanterar input (år/månad). CowAnimation styr Rive. CalculationModal visar fysikberäkningen. IceInfo visar resultatet. Varje komponent har ett tydligt ansvarsområde.

---

**Q: Varför `aria-disabled` istället för `disabled` på knappen?**

> Med `disabled` försvinner fokus — tangentbordsanvändare kan inte längre nå elementet. Med `aria-disabled` kommuniceras inaktivt tillstånd till skärmläsare, men fokus stannar kvar. Vi blockerar istället klick via `pointer-events: none`. Det är en viktig skillnad för tillgänglighet.

---

**Q: Hur fungerar `aria-live`?**

> Det är en region som skärmläsare lyssnar på. När innehållet ändras läses det upp automatiskt. Vi väntar 2 sekunder innan vi uppdaterar texten — för att animationen ska hinna köra klart — och sen läser skärmläsaren upp resultatet med en beskrivning av vad som händer med kon.

---

**Q: Vad är focus trap i modalen?**

> När modalen öppnas sätter vi fokus på den. Tab och Shift+Tab cyklar bara inom modalens interaktiva element — aldrig ut till sidan bakom. När modalen stängs återgår fokus till knappen som öppnade den. Det är APG Dialog-mönstret och nödvändigt för WCAG-kompatibilitet.

---

## 🟦 Block 5 — Utmaningar & beslut

**Q: Vad var svårast att bygga?**

> Rive-integreringen. De nya data-binding-uppdateringarna förändrade hur man kommunicerar med state machine. Jag försökte modellera flera states, men insåg att en enda boolean — `holdsCow` — var enklare och mer robust. Att reducera komplexiteten var rätt beslut.

---

**Q: Varför kraschade Excel?**

> 39 000+ rader från tre SMHI-stationer i olika format. Excel är inte byggt för det. SQLite hanterar det utan problem och gav mig möjlighet att merga och normalisera datan med SQL — rätt verktyg för rätt problem.

---

**Q: Vad hade du gjort annorlunda i produktion?**

> Förberäkna alla kombinationer med ett nattjobb, cach dem statiskt, ingen backend i critical path. HTTPS, proper secrets-hantering, mer robust felhantering, monitoring. Rate limiting är på plats, men det är grundnivå.

---

## 🟦 Block 6 — Snabbfrågor (under 10 sekunder vardera)

| Fråga | Svar |
|---|---|
| Vad returnerar API:et? | `maxIceCm`, `holdsCow`, `freezeDays`, `thawDays`, `fddAtPeak` |
| Vad är Stefan-konstanten? | 2.5 (för saltvatten i Malmö) |
| Vad är minimigränsen för kon? | 11 cm |
| Hur många databasrader? | 39 000+ dagsobservationer |
| Vilka år täcker datan? | 1917–2026 |
| Hur många år/månad-kombinationer finns? | ~1 400 |
| Vad gör `fddAtPeak`? | FDD-värdet vid den dag isen var som tjockast |
| Hur hanteras töväder i FDD? | Positiva grader subtraheras, aldrig under noll |
| WCAG-nivå? | 2.2 AA |
| Varför `lang="sv"` på html-elementet? | Skärmläsare väljer rätt uttal och röst |

---

## 🟦 Block 7 — Om Claude-verktyget

**Q: En hiring manager frågar: "Vem skrev README:n — du eller Claude?"**

> Jag valde varje arkitektoniskt beslut, all kod är min, och jag kan förklara varje rad. Claude var ett verktyg för att formulera och strukturera — som en skrivbordsassistent. Har du en specifik del du vill gå igenom?

---

> **Tips:** Om du kan svara på alla Block 1–5 utan att titta, klarar du intervjun. Block 6 är för att låta säker på detaljer. Block 7 är för att inte bli ställd av en oväntad fråga.
