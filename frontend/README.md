# Ko på Isen – Frontend

Detta är frontend-delen av **Ko på Isen**-projektet.

Byggd med React 19, TypeScript, Vite och Tailwind CSS. Här hanteras all interaktivitet, animation (Rive), och presentation av istjockleksberäkningar och resultat.

## Starta

```bash
npm install
npm run dev
```

## Funktioner
- Välj år och månad för att testa isen
- Se animerad ko stå eller plumsa beroende på istjocklek
- Snygg modal med fysikbeskrivning och formler

## Arkitektur
- React 19, Vite, TypeScript
- Tailwind CSS för styling
- Google Fonts: Bevan (rubriker), Inter (brödtext)
- Rive för vektoranimation

## Se även
- [../README.md](../README.md) för fullständig projektbeskrivning och backend
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
