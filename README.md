# Innoscriptia Case Study

React + TypeScript + Vite news aggregator case study.

## Getting started

```bash
npm install
cp .env.example .env   # then add your API keys
npm run dev
```

Open http://localhost:5173

For Docker, see [DOCKER.md](DOCKER.md).

## Environment variables

The app reads API keys from a `.env` file in the project root. Only variables prefixed with `VITE_` are available in client code via `import.meta.env`.

1. Copy [`.env.example`](.env.example) to `.env`
2. Set `VITE_NEWS_API_KEY`, `VITE_THE_GUARDIAN_API_KEY`, and `VITE_NEW_YORK_TIMES_API_KEY`
3. Restart the dev server after any `.env` change (values are loaded when Vite starts)

TypeScript types for these variables live in [`src/vite-env.d.ts`](src/vite-env.d.ts). Application code should import keys from [`src/helpers/env.ts`](src/helpers/env.ts) rather than reading `import.meta.env` directly.

At startup, the app validates that all required env vars are set (skipped in test mode). If anything is missing, you will see an error pointing you to copy `.env.example` to `.env`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Vitest (watch) |
| `npm run docker:dev` | Docker dev with HMR |
| `npm run docker:prod` | Docker prod (nginx) |

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
