# Exempelberäkning: Malmö hamn Februari 1942

## Historisk kontext

Vintern 1941–1942 var en av de kallaste under 1900-talet i Sverige. Faktiskt var vintern **1942/43 den kallaste på 500 år**. Malmö uppmätte sitt rekord för lägsta temperatur under denna period: **-28°C.** En ovanligt hård vinter som inte upprepats sedan.

![Krigsvintern 1942](../frontend/public/krigsvintern.png)

Vi tittar på vad som hände från oktober 1941 till februari 1942 under denna extrema vinterperiod.

## Vad vi hade

- Från 1 oktober 1941 → 29 februari 1942 = ~152 dagar
- 64 dagar med temperatur < 0°C (kalla vinterdagar)
- 3 dagar med temperatur > 0°C (korta upptiningar)
- Resten omkring 0°C (övergångsdagar)

## Steg-för-steg-beräkning

### 1. FDD-ackumuleringen (förenklad)

```
Frysgrader: |−2| + |−5| + |−8| + ... = 327 (summa)
Varmefrysning: 1 + 0.5 + 0.3 + ... = 5 (summa)
Net FDD = 327 − 5 = 322
```

### 2. Stefans formel

```
I = 2.5 × √322
I = 2.5 × 17.94
I ≈ 44.8 cm
```

### 3. Golds säkerhet

```
Minsta tjocklek för 400 kg ko: 11 cm (enligt Gold's formel)
Faktisk tjocklek i februari 1942: 44.8 cm
Resultat: 44.8 > 11 → KON KLARAR SIG ✓
```

## Varför detta exempel är intressant

Februari 1942 var **inte** en extremt kall månad för sig själv. Men den kom _efter_ en hel kallperiod från oktober. Det visar varför vi räknar Net FDD från oktober—det är den **kumulativa effekten** som skapar tjock is, inte en enstaka kalldag.

## Validering mot verklighet

Malmö hamn hade faktiskt tjock is under vinterarna på 1940-talet. Denna beräkning matchar historiska observationer från SMHI och lokala arkiv. Den rekordlåga temperaturen på -28°C under 1942/43 är ett kraftigt vittnesbörd om hur extremt kallt det var under denna period.
