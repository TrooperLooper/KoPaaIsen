# Ko på Isen — Handoff Brief

## Project Summary
A fullstack portfolio app that answers: "Could a cow stand on the ice in Malmö on any given winter day?" Uses real SMHI weather data (1917–2026), physics-based ice calculations, and an animated cow (Rive) to visualize the result. User selects year/month, app calculates ice thickness and shows if the cow survives or plunges.

---

## Current Status
- **Data**: All SMHI CSVs merged and imported into `weather.db` (SQLite, 39k+ days, 1917–2026)
- **Backend**: Ready to scaffold (see PROJECT.md for plan)
- **Frontend**: Not started
- **README.md**: Contains full logic, formulas, and developer rationale
- **PROJECT.md**: Working doc with all requirements, data strategy, and calculation details
- **InfoModal**: Short, logic-focused explanation template ready for UI

---

## Key Files
- `weather.db` — SQLite database with all daily temps
- `data/` — Raw CSVs (for reference)
- `scripts/importWeatherData.js` — Merge/import script (run once)
- `PROJECT.md` — Working doc, all requirements and logic
- `README.md` — Portfolio-level explanation, formulas, and dev thinking
- `infoModalTemplate.txt` — Short explanation for UI modal

---

## Next Steps
1. Scaffold backend (see plan in PROJECT.md)
2. Implement `/api/ice/:year/:month` endpoint (see API spec)
3. Build frontend (React + Vite + Tailwind)
4. Integrate Rive animation and InfoModal
5. Polish, test, and deploy

---

## Special Notes
- All calculations are based on real physics (Stefan's formula, Gold's rule)
- InfoModal is designed to communicate logic clearly to both users and devs
- See PROJECT.md for all constants, formulas, and edge cases
- See README.md for rationale and pedagogical explanations

---

**Contact:** Lars (original author, 2026)
