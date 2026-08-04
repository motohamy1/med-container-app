# Technology Stack

**Analysis Date:** 2026-08-04

## Languages

**Primary:**
- TypeScript ~6.0.3 — Mobile app (`app/**/*.tsx`, `components/**/*.tsx`, `services/*.ts`, `hooks/*.ts`, `lib/*.ts`, `types/*.ts`)
- JavaScript (Node.js / CommonJS) — Backend server (`backend/server.js`) and maintenance scripts (`scripts/*.js`)

**Secondary:**
- SQL — Supabase schema definitions (`schema.sql`, `setup-drugs-table.sql`)
- CSS — Single Tailwind entry stylesheet (`app/global.css`, 3 lines: `@tailwind base/components/utilities`)
- JSON — Expo config (`app.json`), TS path aliases (`tsconfig.json`)

## Runtime

**Environment:**
- Mobile: React Native 0.86.2 on Expo SDK 57 (file-based routing via `expo-router` ~57.0.9)
- Backend: Node.js (CommonJS; `require()` throughout `backend/server.js`); no engine pin in `backend/package.json`
- React 19.2.3 / `react-dom` 19.2.3 (web target enabled via `react-native-web` ~0.21.0)

**Package Manager:**
- npm (lockfiles present: `package-lock.json`, `backend/package-lock.json`)
- Two separate `node_modules/` trees — mobile app at repo root, backend at `backend/node_modules/`
- No workspace / monorepo config (no `workspaces` field, no `pnpm-workspace.yaml`, no Lerna); the two projects are independently installed

## Frameworks

**Core:**
- Expo SDK 57 (`expo` ^57.0.9) — mobile app shell, build, plugins, splash, status bar
- Expo Router ~57.0.9 — file-based routing; `main: "expo-router/entry"` in `package.json`
- React Native 0.86.2 — host runtime
- NativeWind ^4.2.1 (Tailwind CSS ^3.4.19) — styling layer (className-based Tailwind for RN)
- Express ^4.21.2 — backend HTTP server (`backend/server.js`)

**Testing:**
- Not detected. No test runner, no test files, no `jest`/`vitest`/`mocha` config, no `*.test.*` or `*.spec.*` files. `package.json` has no `test` script.

**Build/Dev:**
- Metro bundler (Expo default) wired through `metro.config.js` with `withNativeWind` wrapper
- Babel via `babel-preset-expo` + `nativewind/babel` + `react-native-reanimated/plugin` (`babel.config.js`)
- PostCSS with `tailwindcss` plugin (`postcss.config.js`) for the web/global CSS pipeline
- `nodemon` ^3.1.9 — backend dev watcher (`npm run dev` in `backend/`)
- ESLint 9 flat config with `eslint-config-expo` ~57.0.1 (`eslint.config.js`); `lint` script = `expo lint`
- TypeScript strict mode (`tsconfig.json` extends `expo/tsconfig.base`)
- `prettier-plugin-tailwindcss` ^0.5.14 (formatter plugin; no standalone Prettier config file)

## Key Dependencies

**Critical (Mobile):**
- `@google/generative-ai` ^0.24.1 — Google Gemini SDK (also listed in backend; the mobile app itself no longer calls Gemini directly — it proxies through the backend — but the dependency remains in `package.json` and is exercised by `scripts/test_gemini.js`)
- `@supabase/supabase-js` ^2.90.1 — Supabase client (Postgres + Auth), initialized in `lib/supabase.ts` with AsyncStorage session persistence
- `expo-router` ~57.0.9, `expo-linking` ~57.0.4 — navigation + deep linking (`scheme: "sayadrug"` in `app.json`)
- `react-native-reanimated` 4.5.1 + `react-native-worklets` 0.10.1 + `react-native-gesture-handler` ~2.32.0 — animation/gesture stack (requires `react-native-reanimated/plugin` in `babel.config.js`)
- `nativewind` ^4.2.1 + `tailwindcss` ^3.4.19 — styling; content globs in `tailwind.config.js` scan `./app/**` and `./components/**`
- `@react-navigation/native` ^7.1.8, `@react-navigation/bottom-tabs` ^7.4.0, `@react-navigation/elements` ^2.6.3 — tab navigation primitives under expo-router

**Critical (Backend):**
- `express` ^4.21.2 — HTTP server, exposes `POST /api/chat` and `GET /health`
- `@google/generative-ai` ^0.24.1 — Gemini generation (model `gemini-flash-latest`, temperature 0.3, maxOutputTokens 2048) in `backend/server.js`
- `cors` ^2.8.5 — permissive CORS (`app.use(cors())` with no allowlist)
- `dotenv` ^16.4.7 — backend env loading (`require('dotenv').config()` at top of `backend/server.js`)

**Declared but unused:**
- `groq-sdk` ^0.37.0 — listed in `backend/package.json` but **not imported anywhere** in `backend/server.js` or scripts. PRODUCT.md mentions a "Groq + Google AI" pipeline, but the current backend only calls Gemini. Dead dependency.

**Infrastructure (Expo modules — pinned to SDK 57):**
- `expo-av` ^16.0.8 (audio capture; `aiService.processAudio` returns a hard-coded "unavailable" stub — voice path is scaffolded but not wired)
- `expo-file-system` ~57.0.1, `expo-asset` ~57.0.8, `expo-font` ~57.0.1, `expo-image` ~57.0.1
- `expo-linear-gradient` ~57.0.1, `expo-haptics` ~57.0.1, `expo-splash-screen` ~57.0.5, `expo-status-bar` ~57.0.1
- `expo-constants` ~57.0.8, `expo-system-ui` ~57.0.2, `expo-symbols` ~57.0.1, `expo-web-browser` ~57.0.2
- `@react-native-async-storage/async-storage` ^2.2.0 — Supabase Auth session persistence (`lib/supabase.ts`)
- `react-native-url-polyfill` ^3.0.0 — `URL` polyfill required by supabase-js on RN (`lib/supabase.ts:4` `import 'react-native-url-polyfill/auto'`)
- `@react-native-masked-view/masked-view` 0.3.2 — gradient tab icons (`app/(tabs)/_layout.tsx`)
- `react-native-safe-area-context` ~5.7.0, `react-native-screens` ~4.26.0 — navigation/safe area
- `react-native-web` ~0.21.0 — web output target (`app.json` `web.bundler: "metro"`)

## Configuration

**Environment:**
- Two `.env` files exist (existence confirmed; contents NOT read per security rules):
  - `.env` (repo root) — consumed by mobile app via Expo public env vars and by root scripts via a hand-rolled parser (`scripts/test_gemini.js`, `scripts/seed_drugs.js`)
  - `backend/.env` — consumed by `backend/server.js` via `dotenv`
- Both `.env` paths are gitignored (`.gitignore` lines 34–37, `backend/` env files covered by `.env.*` pattern)
- Build-time env coupling: Expo exposes vars prefixed with `EXPO_PUBLIC_` to the RN bundle. The backend reads `GEMINI_API_KEY` but falls back to `EXPO_PUBLIC_GEMINI_API_KEY` (`backend/server.js:11`), indicating the same key may be shared across root `.env` and `backend/.env`
- No validation library (no `zod`, `envalid`, `joi`) — env vars are read inline with `||` fallbacks

**Build:**
- `app.json` — Expo config (name `say-a-drug`, slug `say-a-drug`, scheme `sayadrug`, bundle id `com.anonymous.sayadrug`). Plugins: `expo-router`, `expo-splash-screen`, `expo-av`, `expo-asset`, `expo-font`, `expo-image`, `expo-web-browser`, `expo-status-bar`. Experiments: `typedRoutes: true`, `reactCompiler: true`.
- `babel.config.js` — `babel-preset-expo` with `jsxImportSource: "nativewind"`, plus `nativewind/babel` preset and `react-native-reanimated/plugin` (ordering matters: reanimated plugin must be last).
- `metro.config.js` — `withNativeWind(config, { input: "./app/global.css" })`
- `tailwind.config.js` — content globs `app/**` + `components/**`; `presets: [require("nativewind/preset")]`; custom OKLCH color tokens (graphite neutrals + jewel-teal accent + champagne gold), custom `boxShadow` tokens (`glow-cyan`, `glow-gold`, `bubble`, `card`). No plugins.
- `postcss.config.js` — single `tailwindcss: {}` plugin entry
- `tsconfig.json` — extends `expo/tsconfig.base`, `strict: true`, path alias `@/*` → `./*`, includes `.expo/types`, `expo-env.d.ts`, `nativewind-env.d.ts`
- `eslint.config.js` — flat config, single `eslint-config-expo/flat` entry, ignores `dist/*`
- `expo-env.d.ts` / `nativewind-env.d.ts` — ambient type reference stubs (generated; `expo-env.d.ts` is gitignored, `nativewind-env.d.ts` is committed)

**Type safety:**
- Database types are hand-written in `types/supabase.ts` (no generated `supabase gen types` output detected). The `Database` interface models three tables (`profiles`, `drugs`, `user_favorites`) plus an alias `drug_database` pointing at `drugs`. The `drugs` Row carries columns in quotes (e.g. `"Trade_name"`, `"Active_ingredient"`, `"Search Query"`) — migration residue from a CSV import (see `scripts/seed_drugs.js`).

## Platform Requirements

**Development:**
- Node.js (for Metro bundler, Expo CLI, and the Express backend)
- Expo CLI via `npx expo start` / `npm run start`
- iOS simulator / Android emulator or a dev build (README references Expo Go as a limited sandbox)
- Backend dev server: `cd backend && npm run dev` (nodemon) on port 3001 by default
- Mobile app expects `EXPO_PUBLIC_BACKEND_URL` to point at the running backend (defaults to `http://localhost:3001` in `services/aiService.ts:2`)
- Native `ios/` and `android/` folders are gitignored (prebuild / CNG workflow expected)

**Production:**
- Mobile: Expo EAS build / submit (`bundleIdentifier: com.anonymous.sayadrug` on iOS, `package: com.anonymous.sayadrug` on Android). Web output also configured (`web.output: "static"`, `web.bundler: "metro"`).
- Backend: Node process listening on `0.0.0.0:${PORT}` (`backend/server.js:283`); default port 3001. No container/Dockerfile, no PM2 config, no deployment manifest detected — deploy story is ad-hoc.

---

*Stack analysis: 2026-08-04*