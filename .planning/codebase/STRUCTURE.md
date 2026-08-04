# Codebase Structure

**Analysis Date:** 2026-08-04

## Directory Layout

```
medical_arena/
├── app/                  # Expo Router file-based routes (entry layer)
│   ├── (tabs)/           # Bottom-tab navigation group
│   │   ├── _layout.tsx   # Tab bar configuration + gradient icons
│   │   ├── index.tsx     # Home — orbit navigation, search, recent
│   │   ├── ChatTab.tsx   # AI clinical chat (largest screen)
│   │   └── profile.tsx   # User profile + settings
│   ├── heart/index.tsx   # Heart specialty thin wrapper
│   ├── git/index.tsx     # GIT specialty thin wrapper
│   ├── fever/index.tsx   # Fever specialty thin wrapper
│   ├── neuro/index.tsx   # Neuro specialty thin wrapper
│   ├── skin/index.tsx    # Skin specialty thin wrapper
│   ├── women/index.tsx   # Women specialty thin wrapper
│   ├── lungs/index.tsx   # Lungs specialty thin wrapper
│   ├── _layout.tsx       # Root Stack — registers all routes
│   ├── +not-found.tsx    # 404 fallback
│   └── global.css        # Tailwind/NativeWind base import
├── components/
│   └── CategoryPage.tsx  # Shared specialty screen template
├── services/
│   └── aiService.ts      # Mobile → backend HTTP client (chat)
├── lib/
│   └── supabase.ts       # Lazy Supabase client singleton + proxy
├── hooks/
│   └── useUserProfile.ts # Profile hook (currently mocked)
├── types/
│   └── supabase.ts       # Generated-style Database type
├── backend/              # Separate Node/Express service (own package.json)
│   ├── server.js          # Express app, /health + /api/chat
│   ├── package.json
│   └── .env              # Backend secrets (DO NOT READ)
├── scripts/              # Node CLI utilities for data ops
│   ├── check_data.js
│   ├── seed_drugs.js
│   ├── test_gemini.js
│   ├── update_search_query.js
│   └── update_search_query_batch.js
├── assets/                # Images, fonts, icons, data CSV
├── android/ ios/         # Native shells (prebuild output)
├── dist/                  # Build output (gitignored in practice)
├── graphify-out/         # Knowledge-graph cache (generated)
├── app.json              # Expo config (scheme, plugins, icons)
├── babel.config.js       # babel-preset-expo + nativewind + reanimated
├── metro.config.js       # NativeWind wiring (input: app/global.css)
├── tailwind.config.js    # OKLCH palette, shadow tokens
├── tsconfig.json          # TS config, `@/*` path alias to repo root
├── package.json          # Mobile app deps (Expo Router)
├── schema.sql             # Supabase: profiles, drugs, user_favorites
├── setup-drugs-table.sql # Drugs table DDL variant
├── PRODUCT.md            # Product/brand brief
└── README.md             # Default Expo starter README
```

## Directory Purposes

**(app/ (Expo Router routes)):**
- Purpose: All navigation surfaces registered by file path
- Contains: `_layout.tsx` route-group layouts, `<segment>/index.tsx` screens
- Key files: `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/ChatTab.tsx`

**(components/):**
- Purpose: Cross-screen reusable React components
- Contains: Single shared screen template today (`CategoryPage.tsx`)
- Key files: `components/CategoryPage.tsx`

**(services/):**
- Purpose: External I/O wrappers consumed by screens
- Contains: `aiService.ts` (HTTP chat client); alias for backend calls
- Key files: `services/aiService.ts`

**(lib/):**
- Purpose: Infrastructure clients / singletons
- Contains: `supabase.ts` (lazy-init Supabase client + proxy export)
- Key files: `lib/supabase.ts`

**(hooks/):**
- Purpose: Reusable React hooks
- Contains: `useUserProfile.ts` (profile state; Supabase path currently stubbed)
- Key files: `hooks/useUserProfile.ts`

**(types/):**
- Purpose: Cross-cutting TypeScript type definitions
- Contains: `supabase.ts` (Database interface covering `profiles`, `drugs`, `user_favorites`, `drug_database`)
- Key files: `types/supabase.ts`

**(backend/):**
- Purpose: Standalone Node/Express API service with its own deps
- Contains: `server.js` (chat endpoint, AI orchestration), `package.json`, `.env`
- Key files: `backend/server.js`
- Note: Separate `package.json`; installed separately via `cd backend && npm install`

**(scripts/):**
- Purpose: One-off Node CLIs run by humans against Supabase/external APIs
- Contains: drug seeding, search-query updates, Gemini smoke tests
- Key files: `scripts/seed_drugs.js`, `scripts/test_gemini.js`

## Key File Locations

**Entry Points:**
- `app/_layout.tsx`: Root `Stack` — mounts `(tabs)` group + 7 specialty detail screens
- `app/(tabs)/_layout.tsx`: `Tabs` navigator with 3 tabs (Chat, Home, Profile)
- `backend/server.js`: Express server entry (port `3001`)

**Configuration:**
- `app.json`: Expo scheme (`sayadrug`), plugins (router, splash, av, asset, font, image, web-browser, status-bar), `reactCompiler` + `typedRoutes` experiments
- `babel.config.js`: `babel-preset-expo` with NativeWind + `react-native-reanimated/plugin`
- `metro.config.js`: `withNativeWind` wraps default Metro, input `./app/global.css`
- `tailwind.config.js`: OKLCH color tokens (turquoise `oklch(0.76 0.082 192)`, gold, neutral graphite ramp), shadow tokens, `glow-cyan`/`glow-gold`
- `tsconfig.json`: `strict`, path alias `@/*` → repo root, includes `expo-env.d.ts` + `nativewind-env.d.ts`
- `package.json`: `main: "expo-router/entry"`, Expo 57, React 19.2, RN 0.86.2

**Core Logic:**
- `app/(tabs)/ChatTab.tsx`: Largest screen — chat UI, section parser, citation render
- `backend/server.js`: Prompt assembly, HF dataset fetch, EuropePMC fetch, response scrubbing
- `services/aiService.ts`: `sendMessageByText()` HTTP wrapper to backend
- `lib/supabase.ts`: Supabase lazy singleton with AppState-driven auto-refresh
- `types/supabase.ts`: Typed `Database` interface (Row/Insert/Update for each table)

**Data Schema:**
- `schema.sql`: DDL for `profiles`, `drugs`, `user_favorites` with RLS policies
- `setup-drugs-table.sql`: Extended drugs table schema with price tracking columns

**Scripts:**
- `scripts/seed_drugs.js`: Imports drug CSV into Supabase `drugs`
- `scripts/update_search_query.js` / `_batch.js`: Sync drug "Search Query" column
- `scripts/test_gemini.js`: Gemini connectivity smoke test
- `scripts/check_data.js`: Data sanity check

**Secrets (existence only, never read contents):**
- `.env`: App-level Expo public env vars (Supabase URL/key, backend URL)
- `backend/.env`: Backend secrets (Gemini key)

## Naming Conventions

**Files:**
- Routes: lowercase directory with `index.tsx` (e.g. `app/heart/index.tsx`)
- Tab routes: PascalCase matching display title (e.g. `ChatTab.tsx`, `index.tsx`, `profile.tsx`)
- Layout files: `_layout.tsx` (Expo Router convention)
- Services: camelCase (`aiService.ts`)
- Hooks: `use<Name>.ts` (`useUserProfile.ts`)
- Types: lowercase noun (`types/supabase.ts`)

**Directories:**
- Plural lowercase for non-route groupings (`components`, `constants`, `hooks`, `services`, `scripts`, `assets`, `types`)
- Singular lowercase for infra (`lib`)
- Route segments: lowercase, named by specialty / route slug

**Exports:**
- Screens: `export default function <Name>()` (Expo Router requirement)
- Components: named export (e.g. `export const CategoryPage`)
- Service modules: a single object export (e.g. `export const aiService = { … }`)

## Where to Add New Code

**New feature screen (new body-system specialty or sub-page):**
- New route directory: `app/<slug>/index.tsx` (must register its `Stack.Screen` entry in `app/_layout.tsx`)
- If it reuses the specialty template pattern: render `<CategoryPage categoryName=… categoryIcon=… categoryColor=… />` and add topics into the `specialtyTopics` map in `components/CategoryPage.tsx`

**New top-level tab:**
- Add `<Tabs.Screen>` entry in `app/(tabs)/_layout.tsx` and the screen file inside `app/(tabs)/`

**New shared UI component:**
- Place at `components/<PascalName>.tsx`, export as named const
- Wire className tokens from `tailwind.config.js` (turquoise/teal-* palette) to stay on-brand

**New backend route:**
- Add `app.<method>(...)` block in `backend/server.js` (single-file app today; split into `backend/routes/` if more endpoints land)
- If it needs a new external SDK, add dep in `backend/package.json` and `cd backend && npm install`

**New mobile service / external client:**
- Add to `services/<name>Service.ts` (mirrors `aiService.ts`)
- For Supabase-backed features: extend `types/supabase.ts` with the new table's Row/Insert/Update, then read via the proxy in `lib/supabase.ts`

**New React hook:**
- Place at `hooks/use<Name>.ts`, return an object literal as `useUserProfile` does

**New data script:**
- Place at `scripts/<verb>_<noun>.js`, load env from `../.env` via the inline parser (see `scripts/seed_drugs.js`), run with `node scripts/<name>.js`

## Special Directories

**assets/:**
- Purpose: Static images (icons, splash), fonts, and the seed-data CSV (`assets/data/database112024(Sheet1).csv`)
- Generated: No
- Committed: Yes

**android/ & ios/:**
- Purpose: Native project shells produced by Expo prebuild / `expo run:android|ios`
- Generated: Yes (by prebuild)
- Committed: Yes (to support bare workflows)

**dist/:**
- Purpose: Packaged app output
- Generated: Yes
- Committed: No (treat as build artifact)

**graphify-out/:**
- Purpose: Knowledge-graph cache produced by the `graphify-windows` skill (graph.html, graph.json, cost.json, manifest.json)
- Generated: Yes
- Committed: No (generated output)

**node_modules/ (root and backend/):**
- Purpose: Dependencies — root for Expo app, `backend/node_modules/` for Express service
- Generated: Yes (`npm install` in each)
- Committed: No

**.planning/:**
- Purpose: GSD planning artifacts (PROJECT.md, ROADMAP, codebase maps, phase docs)
- Generated: Yes (by GSD workflow)
- Committed: Yes (GSD convention)

**.expo/:**
- Purpose: Expo CLI cache / typing generation
- Generated: Yes
- Committed: No

---

*Structure analysis: 2026-08-04*