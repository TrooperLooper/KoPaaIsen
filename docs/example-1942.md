# Exempelberäkning: Öresund Februari 1942

## Historisk kontext

Vintern 1941–1942 var **den kallaste av de tre krigsvintrarna** och säkerligen en av de kallaste på 500 år. Under perioden januari 25-30, 1942 drabbades södra Sverige av extrem kyla: 20-30°C under noll, lokalt ner till -35°C. Malmö nådde sitt rekord: **-28.0°C** (enligt SMHI blogg).

![Krigsvintern 1942](https://raw.githubusercontent.com/TrooperLooper/KoPaaIsen/main/frontend/public/krigsvintern.png)

Men temperaturerna berättar inte hela historien. Öresund frös till medan **Danmark var under nazistisk ockupation** och Sverige förblev neutralt. I Malmö var fiskehoddarna tomma och många familjer försökte överleva på bara kål och skarpsill. Livsmedelsbristen ledde till att ett par tusen husmödrar den 10 september 1942 samlades på Möllevångstorget i ett kollektivt uppror, som sen döptes **"Sillaupproret"**. På den danska sidan ökade motståndsrörelsens sabotager av den tyska krigsmaskinen och därmed intensifierades Gestapos jakt på dom. På båda sidor av sundet blickade man mot isen med osäkra förhoppningar om framtiden.

**Minnet av 1928:** Dom som hade upplevt vintern 1928/29 kunde berätta att Öresund hade frusit helt till redan före jul. Hela familjer vandrade från Rungsted i Danmark till Hven i Sverige, men stoppades av svenska tullare. Karen Nordstrøm, som upplevde den vintern som barn, berättade:

> _Karen Nordstrøm, der oplevede denne vinter som barn, har fortalt, at folk begyndte at gå til Sverige fra stranden i Rungsted. Sammen med sine forældre tog Karen også turen over isen, og efter en lang vandring nåede de endelig Hven. Men da de gjorde sig klar til at hvile lidt ud på stranden, blev de stoppet af svenske toldere. De var nidkære nok til at sende familien hele vejen tilbage til Rungsted, fordi de ikke havde taget pas med._

Och i ´42 ryktades det igen om att man kunde ta sig över Storebält. Men att göra samma antagelse om Öresund var farligare av skäl som jag kommer inn på senare.

Vi tittar först på vad som hände med temperaturerna från oktober 1941 till februari 1942 under denna extrema vinterperiod.

## Vad vi ser i datan från SMHIs meteorologiska arkiv i Malmö:

- Från 1 oktober 1941 → 29 februari 1942 = ~152 dagar
- 64 dagar med temperatur < 0°C (kalla vinterdagar)
- 3 dagar med temperatur > 0°C (korta upptiningar)
- Resten omkring 0°C (övergångsdagar)

## Varför FDD blev så stor

Det kritiska var inte bara att januari var fruktansvärt kall, utan att **februari och mars också förblev extremt kalla**. Månadsmedeltemperaturen låg långt under -10°C — ovanligt även för svenska mått. Denna långvariga kyla under hela höst-vinter-perioden från oktober 1941 är vad som skapade rekordhöga FDD-värden. Läs mer om FDD i physics.md.

## Så här beräknades isens tjocklek i februari 1942:

### 1. FDD-ackumuleringen

Vintern fram till februari 1942 hade:

```
434 netto frostgraddygn
```

### 2. Stefans formel för isens tjocklek

```
I = 2.5 × √434
I = 2.5 × 20.8
I = 52.1 cm
```

### 3. Golds regel för isens bärighet

```
Minsta tjocklek för 400 kg ko: 11 cm (enligt Gold's formel)
Faktisk tjocklek i februari 1942: 52.1 cm
Resultat: 52.1 > 11 → KON KLARAR SIG ✓
```

## Varför detta historiska exempel är intressant

Februari 1942 var **inte** en extremt kall månad för sig själv. Men den kom _efter_ en ovanligt lång kallperiod från oktober. Det är därför jag valde att räkna Net FDD från oktober—det är den **kumulativa effekten** som skapar tjock is, inte en enstaka kalldag. Denna månads rekordistjocklek är också anledningen till att den valdes som default-scenario i appen.

## Validering mot verklighet

Simuleringen stämmer nära med observationerna i de faktiska loggböckerna: **vid Dragør i februari 1942 mättes ~50 cm is** — nästan i linje med vad Stefan-formeln ger för denna period.

Men publikationen från "Statens Isbrydnings- og Ismeldingstjeneste" avslöjar dessutom varför det var livsfarligt att korsa isen: **sex DSB-isbrytare** bröt systematiskt upp skeppsrutter vid den danska sidan av der frusna Öresund den vintern. Vilket möjliggjorde att tyska patrullbåtar kunde bevakade farvattnen. Isen som såg stark ut från land var i verkligheten ett fälla av snötäckta sprickor och isröra.

## Isen som fälla, natten 5–6 mars 1942

Natten den 5–6 mars 1942 försökte **tre danska motståndskämpare** ta sig över isen till Sverige. Två omkom i försöket. En överlevde.

![Motståndsman på isen, 1942](https://raw.githubusercontent.com/TrooperLooper/KoPaaIsen/main/frontend/public/modstandsmand_1942.jpg)
_Fotografi taget från ett svenskt flygplan, av den enda överlevaren, och var här för utmattad för att nå räddningspaket som kastades ner._

Andra grupper som hade mer tur flydde i sin tur till Sverige genom att gemensamt knuffa roddbåtar framför sig över isen, redo att hoppa ner i båten när isen brast.

_(Källa: Dennis Christian Larsen, Frihedsmuseet; Lea Porse Rasmussen, Danmarks Nationalarkiv — via *Is- og Besejlingsforholdene i de danske Farvande, Vinteren 1941–42*, Statens Isbrydnings- og Ismeldingstjeneste.)_

## En case i domänkunnskap

Genom att gräva efter djupare svar på hur det kom sig att motståndsännen omkom, lärde jag mig något viktigt om datakällor. Att ett korrekt svar inte alltid är detsamma som ett sant svar.

Ju djupare domänkunskap man har, desto bättre frågor kan man ställa om vad det man tittar på. Om det så är när ett a11y-verktyg som indikerar att en webbplats är tillgänglig utan att någon testat den med tangentbord eller när självsäkra AI-genererade påståenden låter rätt men aldrig verifierats mot verkligheten.

## Källor och vidare läsning

- **DMI** och **SMHI** — meteorologiska data
- **Dennis Christian Larsen**, Frihedsmuseet — motståndsrörelsens berättelser och fotografier
- **Lea Porse Rasmussen**, Danmarks Nationalarkiv — fartygsloggböcker och källverifiering
- [_Is- og Besejlingsforholdene i de danske Farvande, Vinteren 1941–42_ (Statens Isbrydnings- og Ismeldingstjeneste)](https://www.forsvaret.dk/globalassets/fko---sovarnet/svk/dokumenter/is-og-besejlingsforhold-i-danske-farvande/-is-og-besejlingsforhold-i-danske-farvande-1942-1943-.pdf)
- [Är isvintern en saga blot? (TV2 Vejr, 2022)](https://vejr.tv2.dk/2022-03-02-er-isvinteren-en-saga-blot)
- [Dengang der var isvintre og vi kunne gå til Sverige (Sjællandske Nyheder)](https://www.sn.dk/art6227397/hoersholm-kommune/lokalhistorie/dengang-der-var-isvintre-og-vi-kunne-gaa-til-sverige/)
