<!-- GSD:project-start source:PROJECT.md -->

## Project

**Medical Arena — Knowledge Ingestion Reliability**

Medical Arena is a dark, AI-native clinical decision-support mobile app (Expo/RN + Express backend) for practicing physicians and residents. Its knowledge layer — specialty topics organized by body system, each with categories for Emergencies, Clinical Topics, Tools & Diagnostics, and Recent Research — is populated by a backend "Autonomous Scientist Agent" that brainstorms topics, retrieves literature, synthesizes structured clinical content via LLMs, and writes to Supabase. This milestone makes that ingestion pipeline robust enough to fill every specialty with 50+ verified topics per category without manual babysitting.

**Core Value:** A clinician can trust the reference: every specialty/category reaches its 50+ topic target with complete, well-formed clinical content — produced reliably by the pipeline, never silently missing or corrupted.

### Constraints

- **Tech stack**: Node/Express CommonJS backend, @google/generative-ai SDK, Supabase JS client — work within these; no rewrite into another framework
- **Providers**: Free-tier keys (Gemini primary); rate limits are real — design around quotas, not against them
- **Cost**: Prefer free tiers; avoid doubling token spend per topic (retry budgets must be bounded)
- **Data safety**: Medical content — nothing auto-publishes past the knowledge_review_queue without passing validation gates
- **Windows dev environment**: Backend runs under nodemon on the user's laptop; long runs must tolerate restarts

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- TypeScript ~6.0.3 — Mobile app (`app/**/*.tsx`, `components/**/*.tsx`, `services/*.ts`, `hooks/*.ts`, `lib/*.ts`, `types/*.ts`)
- JavaScript (Node.js / CommonJS) — Backend server (`backend/server.js`) and maintenance scripts (`scripts/*.js`)
- SQL — Supabase schema definitions (`schema.sql`, `setup-drugs-table.sql`)
- CSS — Single Tailwind entry stylesheet (`app/global.css`, 3 lines: `@tailwind base/components/utilities`)
- JSON — Expo config (`app.json`), TS path aliases (`tsconfig.json`)

## Runtime

- Mobile: React Native 0.86.2 on Expo SDK 57 (file-based routing via `expo-router` ~57.0.9)
- Backend: Node.js (CommonJS; `require()` throughout `backend/server.js`); no engine pin in `backend/package.json`
- React 19.2.3 / `react-dom` 19.2.3 (web target enabled via `react-native-web` ~0.21.0)
- npm (lockfiles present: `package-lock.json`, `backend/package-lock.json`)
- Two separate `node_modules/` trees — mobile app at repo root, backend at `backend/node_modules/`
- No workspace / monorepo config (no `workspaces` field, no `pnpm-workspace.yaml`, no Lerna); the two projects are independently installed

## Frameworks

- Expo SDK 57 (`expo` ^57.0.9) — mobile app shell, build, plugins, splash, status bar
- Expo Router ~57.0.9 — file-based routing; `main: "expo-router/entry"` in `package.json`
- React Native 0.86.2 — host runtime
- NativeWind ^4.2.1 (Tailwind CSS ^3.4.19) — styling layer (className-based Tailwind for RN)
- Express ^4.21.2 — backend HTTP server (`backend/server.js`)
- Not detected. No test runner, no test files, no `jest`/`vitest`/`mocha` config, no `*.test.*` or `*.spec.*` files. `package.json` has no `test` script.
- Metro bundler (Expo default) wired through `metro.config.js` with `withNativeWind` wrapper
- Babel via `babel-preset-expo` + `nativewind/babel` + `react-native-reanimated/plugin` (`babel.config.js`)
- PostCSS with `tailwindcss` plugin (`postcss.config.js`) for the web/global CSS pipeline
- `nodemon` ^3.1.9 — backend dev watcher (`npm run dev` in `backend/`)
- ESLint 9 flat config with `eslint-config-expo` ~57.0.1 (`eslint.config.js`); `lint` script = `expo lint`
- TypeScript strict mode (`tsconfig.json` extends `expo/tsconfig.base`)
- `prettier-plugin-tailwindcss` ^0.5.14 (formatter plugin; no standalone Prettier config file)

## Key Dependencies

- `@google/generative-ai` ^0.24.1 — Google Gemini SDK (also listed in backend; the mobile app itself no longer calls Gemini directly — it proxies through the backend — but the dependency remains in `package.json` and is exercised by `scripts/test_gemini.js`)
- `@supabase/supabase-js` ^2.90.1 — Supabase client (Postgres + Auth), initialized in `lib/supabase.ts` with AsyncStorage session persistence
- `expo-router` ~57.0.9, `expo-linking` ~57.0.4 — navigation + deep linking (`scheme: "sayadrug"` in `app.json`)
- `react-native-reanimated` 4.5.1 + `react-native-worklets` 0.10.1 + `react-native-gesture-handler` ~2.32.0 — animation/gesture stack (requires `react-native-reanimated/plugin` in `babel.config.js`)
- `nativewind` ^4.2.1 + `tailwindcss` ^3.4.19 — styling; content globs in `tailwind.config.js` scan `./app/**` and `./components/**`
- `@react-navigation/native` ^7.1.8, `@react-navigation/bottom-tabs` ^7.4.0, `@react-navigation/elements` ^2.6.3 — tab navigation primitives under expo-router
- `express` ^4.21.2 — HTTP server, exposes `POST /api/chat` and `GET /health`
- `@google/generative-ai` ^0.24.1 — Gemini generation (model `gemini-flash-latest`, temperature 0.3, maxOutputTokens 2048) in `backend/server.js`
- `cors` ^2.8.5 — permissive CORS (`app.use(cors())` with no allowlist)
- `dotenv` ^16.4.7 — backend env loading (`require('dotenv').config()` at top of `backend/server.js`)
- `groq-sdk` ^0.37.0 — listed in `backend/package.json` but **not imported anywhere** in `backend/server.js` or scripts. PRODUCT.md mentions a "Groq + Google AI" pipeline, but the current backend only calls Gemini. Dead dependency.
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

- Two `.env` files exist (existence confirmed; contents NOT read per security rules):
- Both `.env` paths are gitignored (`.gitignore` lines 34–37, `backend/` env files covered by `.env.*` pattern)
- Build-time env coupling: Expo exposes vars prefixed with `EXPO_PUBLIC_` to the RN bundle. The backend reads `GEMINI_API_KEY` but falls back to `EXPO_PUBLIC_GEMINI_API_KEY` (`backend/server.js:11`), indicating the same key may be shared across root `.env` and `backend/.env`
- No validation library (no `zod`, `envalid`, `joi`) — env vars are read inline with `||` fallbacks
- `app.json` — Expo config (name `say-a-drug`, slug `say-a-drug`, scheme `sayadrug`, bundle id `com.anonymous.sayadrug`). Plugins: `expo-router`, `expo-splash-screen`, `expo-av`, `expo-asset`, `expo-font`, `expo-image`, `expo-web-browser`, `expo-status-bar`. Experiments: `typedRoutes: true`, `reactCompiler: true`.
- `babel.config.js` — `babel-preset-expo` with `jsxImportSource: "nativewind"`, plus `nativewind/babel` preset and `react-native-reanimated/plugin` (ordering matters: reanimated plugin must be last).
- `metro.config.js` — `withNativeWind(config, { input: "./app/global.css" })`
- `tailwind.config.js` — content globs `app/**` + `components/**`; `presets: [require("nativewind/preset")]`; custom OKLCH color tokens (graphite neutrals + jewel-teal accent + champagne gold), custom `boxShadow` tokens (`glow-cyan`, `glow-gold`, `bubble`, `card`). No plugins.
- `postcss.config.js` — single `tailwindcss: {}` plugin entry
- `tsconfig.json` — extends `expo/tsconfig.base`, `strict: true`, path alias `@/*` → `./*`, includes `.expo/types`, `expo-env.d.ts`, `nativewind-env.d.ts`
- `eslint.config.js` — flat config, single `eslint-config-expo/flat` entry, ignores `dist/*`
- `expo-env.d.ts` / `nativewind-env.d.ts` — ambient type reference stubs (generated; `expo-env.d.ts` is gitignored, `nativewind-env.d.ts` is committed)
- Database types are hand-written in `types/supabase.ts` (no generated `supabase gen types` output detected). The `Database` interface models three tables (`profiles`, `drugs`, `user_favorites`) plus an alias `drug_database` pointing at `drugs`. The `drugs` Row carries columns in quotes (e.g. `"Trade_name"`, `"Active_ingredient"`, `"Search Query"`) — migration residue from a CSV import (see `scripts/seed_drugs.js`).

## Platform Requirements

- Node.js (for Metro bundler, Expo CLI, and the Express backend)
- Expo CLI via `npx expo start` / `npm run start`
- iOS simulator / Android emulator or a dev build (README references Expo Go as a limited sandbox)
- Backend dev server: `cd backend && npm run dev` (nodemon) on port 3001 by default
- Mobile app expects `EXPO_PUBLIC_BACKEND_URL` to point at the running backend (defaults to `http://localhost:3001` in `services/aiService.ts:2`)
- Native `ios/` and `android/` folders are gitignored (prebuild / CNG workflow expected)
- Mobile: Expo EAS build / submit (`bundleIdentifier: com.anonymous.sayadrug` on iOS, `package: com.anonymous.sayadrug` on Android). Web output also configured (`web.output: "static"`, `web.bundler: "metro"`).
- Backend: Node process listening on `0.0.0.0:${PORT}` (`backend/server.js:283`); default port 3001. No container/Dockerfile, no PM2 config, no deployment manifest detected — deploy story is ad-hoc.

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Languages

- TypeScript (`strict: true`) — all React Native / Expo app code under `app/`, `components/`, `services/`, `hooks/`, `lib/`, `types/`
- JavaScript (CommonJS) — Express backend at `backend/server.js` and admin scripts under `scripts/` (Node, no TS)
- CSS — single stylesheet `app/global.css` consumed by NativeWind via Metro (`metro.config.js`)
- SQL — `schema.sql`, `setup-drugs-table.sql` (schema bootstrap for Supabase `drugs` / `drug_database` tables)

## Naming Patterns

- React components / screens: `PascalCase.tsx` for shared components (`components/CategoryPage.tsx`); route files use Expo Router's reserved names — `index.tsx`, `_layout.tsx`, `+not-found.tsx` (`app/(tabs)/ChatTab.tsx`, `app/heart/index.tsx`)
- Non-component TS modules: `camelCase.ts` (`services/aiService.ts`, `hooks/useUserProfile.ts`, `lib/supabase.ts`)
- Auto-generated types: `*-env.d.ts` (`expo-env.d.ts`, `nativewind-env.d.ts`) plus hand-written `types/supabase.ts` (Supabase-generated `Database` shape — keep PascalCase `Database` export name)
- Backend & scripts: `camelCase.js` (`backend/server.js`, `scripts/seed_drugs.js`, `scripts/update_search_query.js`)
- Config: `kebab-case.config.js` for toolchain (`babel.config.js`, `metro.config.js`, `postcss.config.js`), root-level `tailwind.config.js`, `eslint.config.js`, `tsconfig.json`
- React screen components: `export default function Name()` for route screens (`app/(tabs)/ChatTab.tsx:433`, `app/(tabs)/profile.tsx:282`, `components/CategoryPage.tsx:58`)
- Named-export functional components for reusable pieces: `export const CategoryPage: React.FC<CategoryPageProps> = ...` (`components/CategoryPage.tsx:58`)
- Internal building-block components defined inside the same file (not exported): `const Header = () => (...)`, `const SearchBar = () => (...)`, `const OrbitButton = (...) => (...)`, `const ChatBubble: React.FC<...> = ...` — see `app/(tabs)/index.tsx:48-237`, `app/(tabs)/ChatTab.tsx:231-431`, `app/(tabs)/profile.tsx:111-279`
- Async service methods on a singleton object: `export const aiService = { async sendMessageByText(...), async processAudio(...) }` (`services/aiService.ts:15`)
- Hooks: `export const useUserProfile = () => { ... }` (`hooks/useUserProfile.ts:7`); prefix all custom hooks with `use`
- Backend async helpers: `async function fetchMedicalKnowledge(query)`, `function callAI(prompt, retries = 3)` (`backend/server.js:28,92`)
- Local state: `const [x, setX] = useState<T>(initial)` — `setX` setter naming enforced (`app/(tabs)/ChatTab.tsx:435-438`)
- Constants: `UPPER_SNAKE_CASE` for compile-time-ish values (`SCREEN_WIDTH`, `ORBIT_SIZE`, `FLOATING_TAB_BAR_HEIGHT`, `CHAT_BOTTOM_OFFSET`, `CATEGORIES`, `QUICK_PROMPTS`, `SECTION_CONFIG`, `FALLBACK_PALETTE`, `GRADIENT_COLORS`, `INACTIVE_COLOR`) — defined at module top before use (`app/(tabs)/index.tsx:16-30`, `app/(tabs)/ChatTab.tsx:36-201`, `app/(tabs)/_layout.tsx:7-8`)
- Module-private singletons: `let supabaseInstance` cached via lazy init (`lib/supabase.ts:11`)
- Interfaces: PascalCase, only for object shapes that need declaration merging (Supabase `Database` in `types/supabase.ts:9`)
- Type aliases: `type Message = { ... }`, `type CategoryOption`, `type QuickPrompt`, `type Citation`, `type DoctorCategory`, `type MedicalSection`, `type TopicItem` — defined locally above the component that uses them (`app/(tabs)/ChatTab.tsx:42-72,203`, `components/CategoryPage.tsx:13-23`, `services/aiService.ts:4-13`)
- Props types: co-located, named `XProps` (`type CategoryPageProps` at `components/CategoryPage.tsx:13`) or inline object literal in the FC generic
- Use `keyof typeof Ionicons.glyphMap` for icon-name props (see `categoryIcon` in `components/CategoryPage.tsx:15`, `icon` in `app/(tabs)/profile.tsx:22`)
- Avoid `any` except where Expo Router's `router.push` is forced through (`router.push(route as any)` at `app/(tabs)/index.tsx:126`) — use a typed `as any` cast rather than weakening the API

## Code Style

- Linting-driven formatting only — ESLint is the only enforced style tool; **no Prettier config is present** (root `eslint.config.js`)
- Indentation: 2 spaces in app/TS files; 4 spaces in `backend/server.js` and `scripts/*.js` (CommonJS Node convention)
- Strings: double quotes `"..."` in most TS files (`app/(tabs)/ChatTab.tsx`, `app/(tabs)/_layout.tsx`); single quotes `'...'` mixed in (`components/CategoryPage.tsx`, `app/(tabs)/profile.tsx`, `app/(tabs)/index.tsx`) — **not consistent across files**, prefer double quotes for new files to match the largest screen modules
- Trailing commas: used in multi-line objects/arrays; semicolons: omitted in most TS files (ESLint-preprocess), present in `scripts/*.js`
- Import order (de facto): 1) external packages, 2) React/react-native primitives, 3) project modules with relative paths. Group with blank line between sections (see `app/(tabs)/ChatTab.tsx:1-34`, `app/(tabs)/index.tsx:1-14`)
- Tool: ESLint 9 flat config (`eslint.config.js`)
- Config: `eslint-config-expo/flat` (the Expo preset for RN + Expo Router) plus an `ignores: ['dist/*']` block
- Run: `npm run lint` → `expo lint`
- TypeScript: `tsconfig.json` extends `expo/tsconfig.base` with `strict: true`, `esModuleInterop: true`, `allowSyntheticDefaultImports: true`
- NativeWind v4 (Tailwind v3 preset) via `babel-preset-expo` with `jsxImportSource: "nativewind"` (`babel.config.js`)
- Tailwind tokens defined in `tailwind.config.js` — OKLCH color ramp for `background`/`teal-*`/`turquoise`/`gold`/`charcoal`, plus named shadows `shadow-glow-cyan`, `shadow-glow-gold`, `shadow-bubble`, `shadow-card`
- Prefer `className="..."` utility classes over inline `style={{}}`. Inline style is reserved for computed/dynamic values (sizes from `Dimensions`, opacity from Reanimated shared values, color suffix concatenation like `cfg.border + "65"`) — see `app/(tabs)/index.tsx:133-134`, `app/(tabs)/ChatTab.tsx:253-296`
- Color hex literals are sprinkled into JSX (e.g. `"#6ec2be"`, `"#a3a8af"`, `"#101214"`); for new code prefer the named Tailwind tokens (`text-turquoise`, `bg-teal-dark`) over hardcoded hex

## Import Organization

- `@/*` → `./*` (configured in `tsconfig.json:7-9`) — **available but rarely used**; in practice files use relative paths. Prefer `@/` alias for new top-level imports to reduce `../../` depth

## Error Handling

- **Service layer — graceful degradation to a user-facing fallback string.** Network/parse failures in `aiService.sendMessageByText` are caught, logged via `console.error('AI Service Error:', error)`, and a friendly reply is returned rather than rethrown: `"I'm sorry, I can't reach the medical AI server right now..."` (`services/aiService.ts:42-45`). Always return the documented return shape `{ reply, citations? }`.
- **HTTP non-OK responses** return a fallback reply instead of throwing (`services/aiService.ts:32-35`)
- **Backend API route** wraps the full handler body in `try/catch`, logs `[route] err.message`, and returns `res.status(500).json({ error, reply })` so the client always gets a reply field (`backend/server.js:273-279`)
- **Backend AI calls** use an explicit retry loop with exponential backoff inside `callAI(prompt, retries = 3)` — throws only after the final attempt (`backend/server.js:92-110`); returns `''` on missing key
- **External fetch helpers** (`fetchMedicalKnowledge`, `fetchEuropePMC`) swallow errors and return empty `''` / `[]` so a single upstream failure never breaks the chat (`backend/server.js:28-90`)
- **Component error logging** — UI handlers wrap await in `try/catch` and `console.error(error)` without user-visible alerts (`app/(tabs)/ChatTab.tsx:500-507`)
- **Domain-guard failures** use `Alert.alert(title, body)` for feature gates (`Alert.alert("Coming Soon", ...)` at `app/(tabs)/ChatTab.tsx:457`) and confirmations (`Alert.alert("Copied", ...)` at `:465`)
- **Startup validation**: backend logs `CRITICAL: GEMINI_API_KEY is missing in backend/.env` on boot but does **not** exit — the server keeps running and surfaces the error per-request (`backend/server.js:13-15`)

## Logging

- Tagged prefixes for server logs: `console.error('[/api/chat]', err.message)` (`backend/server.js:274`), `console.log(\`[AI Response Category: ${category}]...\`)` (`backend/server.js:270`), `console.log(\`✅ Med Arena Clinical Backend running...\`)` (`backend/server.js:284`)
- Client errors: `console.error('Chat API error:', response.status)` and `console.error('AI Service Error:', error)` (`services/aiService.ts:33,43`), `console.error(error)` inside UI handlers (`app/(tabs)/ChatTab.tsx:504`)
- Diagnostic scripts in `scripts/` print structured headers: `console.log("--- Gemini API Diagnostics ---")` (`scripts/test_gemini.js`)

## Comments

- Use `//` line comments for section banners and intent inside large files: `// Header Component`, `// Search Bar Component`, `// Orbit Button Component`, `// Recent Inquiries Component` (`app/(tabs)/index.tsx:47,75,111,203`); `// ─── Helpers ───`, `// ─── Routes ───`, `// ─── Start ───` (boxed comment dividers in `backend/server.js:26,112,282`)
- Inline `//` for non-obvious workarounds — `// Lazy initialization to avoid SSR issues with Expo Router web` (`lib/supabase.ts:10`), `// Only initialize on client side` (`lib/supabase.ts:19`), `// Top 3 most relevant papers` (`backend/server.js:70`), `// Tells Supabase Auth to continuously refresh the session...` (`lib/supabase.ts:29-33`)
- TODO-style notes are scarce; one example inside `hooks/useUserProfile.ts:14`: `// Optionally set a mock user ID here if needed for testing auth-gated features`
- Minimal. Only `aiService` carries a brief `/** ... */` block describing method purpose (`services/aiService.ts:16-19`). No project-wide JSDoc convention — do not consider JSDoc required, but add it when a service contract changes (params, return shape, side-effects).

## Function Design

- Typed object props for components, never positional booleans
- Multiple optional params default to sensible values: `aiService.sendMessageByText(message, mode = 'general', category = 'physicians')` (`services/aiService.ts:20-22`)
- Use discriminated unions for closed sets: `DoctorCategory = 'physicians' | 'dentists' | 'physiotherapy'` (`services/aiService.ts:4`)
- Services return structured objects: `Promise<{ reply: string; citations?: Citation[] }>` (`services/aiService.ts`)
- Hooks return a tuple-shaped object: `{ profile, loading, userId }` (`hooks/useUserProfile.ts:19`)
- Backend fetch helpers return empty values on failure rather than `null`/`undefined` — preserves type narrowing at the call site

## Module Design

- Default export for screens/route components (Expo Router requirement): `export default function Index()` (`app/(tabs)/index.tsx:244`)
- Named exports for reusable components & singletons: `export const CategoryPage` (`components/CategoryPage.tsx:58`), `export const aiService` (`services/aiService.ts:15`), `export const useUserProfile`, `export const getSupabaseClient`, `export const supabase` (lazy Proxy)
- Types co-exported from the module that owns them: `Citation`, `DoctorCategory` exported from `services/aiService.ts` and re-imported at `app/(tabs)/ChatTab.tsx:34`
- Backend uses `require()` CommonJS — no ESM import/export in `backend/server.js` or `scripts/`

## Constants & Config Layout

- `constants/` exists but is currently empty — the project puts ad-hoc config objects inline at the top of screen files (`CATEGORIES`, `QUICK_PROMPTS`, `SECTION_CONFIG`, `categoryRoutes`). For new shared lookup tables, prefer extracting them to `constants/<feature>.ts` and importing via `@/constants/...`.
- Environment keys are read through `process.env.EXPO_PUBLIC_*` (client) and `process.env.*` via `dotenv` (backend). Always fall back to a safe default: `process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3001'` (`services/aiService.ts:1-2`), `process.env.EXPO_PUBLIC_SUPABASE_URL || ''` (`lib/supabase.ts:7`)

## Routing & Layout Conventions

- Expo Router file-based routing: route groups use parenthesized dir names (`app/(tabs)/`); segment layout via `_layout.tsx`; not-found fallback via `+not-found.tsx`
- Each specialty page (`app/heart/index.tsx`, `app/git/index.tsx`, `app/fever/index.tsx`, `app/neuro/index.tsx`, `app/skin/index.tsx`, `app/women/index.tsx`, `app/lungs/index.tsx`) is a thin wrapper that renders `<CategoryPage>` with category props — **new medical categories should follow this 11-line pattern** rather than duplicating UI
- Root `app/_layout.tsx` must register every sibling route as a `<Stack.Screen name="...">` so the router type-checks them (`app/_layout.tsx:13-20`)

## Animation Conventions (Reanimated)

- Use `react-native-reanimated` (v4) for animation; declare the Reanimated babel plugin in `babel.config.js:9`
- Mounted-enter animations use the `entering={FadeIn.duration(...).delay(idx * step)}` / `FadeInDown` / `FadeInUp` / `ZoomIn` props on `Animated.View` (`app/(tabs)/ChatTab.tsx:254,321,347,417`)
- Looping pulses use `useSharedValue` + `withRepeat(withSequence(withTiming(...)))` (`ThinkingIndicator` at `app/(tabs)/ChatTab.tsx:301-333`)
- Style-mirror via `useAnimatedStyle(() => ({ ... }))` — never write animated values into `className`/inline `style` directly

## Backend Conventions (Node/Express)

- Single `server.js`, CommonJS `require()`, plain Express with `app.use(cors())` + `app.use(express.json())` (`backend/server.js:6-8`)
- Helpers defined as module-scope `async function name()` before the route block, then routes, then `app.listen(PORT, '0.0.0.0', ...)` (`backend/server.js:283`)
- Health check route is mandatory: `app.get('/health', (_req, res) => res.json({ status: 'ok' }))` (`backend/server.js:115`)
- API routes are prefixed `/api/<resource>` (only `/api/chat` today). Validate body and return `400` with `{ error }` before processing (`backend/server.js:120`)
- AI prompts are constructed as template literals embedding the persona, knowledge context, and strict formatting rules; the response is then aggressively scrubbed (`backend/server.js:248-266`) — keep the scrubber in lockstep with the prompt's section delimiters (`##SECTION##` / `##END##`)

## Git / Repo Conventions

- `.gitignore` excludes `node_modules/`, `.expo/`, build outputs and `.env`; `dist/` is additionally ignored by ESLint (`eslint.config.js:8`)
- `.env` files are present at root and in `backend/` — never commit secrets, only note their existence

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Root Stack | Registers all route groups and specialty detail screens | `app/_layout.tsx` |
| Tab Navigator | Three-tab layout (Chat / Home / Profile), gradient icon mask | `app/(tabs)/_layout.tsx` |
| Home screen | Orbit-nav to specialties + search + recent consultations | `app/(tabs)/index.tsx` |
| ChatTab | Clinical chat UI, AI message rendering, section parser | `app/(tabs)/ChatTab.tsx` |
| Profile | Profile header, stat cards, AI settings toggles | `app/(tabs)/profile.tsx` |
| Specialty routes | One-per-body-system thin wrappers rendering CategoryPage | `app/heart/index.tsx` ... `app/lungs/index.tsx` |
| CategoryPage | Shared specialty screen template + high-yield topic map | `components/CategoryPage.tsx` |
| aiService | HTTP client `sendMessageByText()` against backend `/api/chat` | `services/aiService.ts` |
| Supabase client | Lazy Supabase singleton + Proxy for ergonomic import | `lib/supabase.ts` |
| useUserProfile | React hook returning `{profile, loading, userId}` (mocked) | `hooks/useUserProfile.ts` |
| Database types | Typed `Database` interface (Row/Insert/Update for all tables) | `types/supabase.ts` |
| Backend server | Express app: `/health`, `/api/chat`; AI orchestration | `backend/server.js` |
| DB schema | DDL + RLS policies for Supabase tables | `schema.sql` |
| Drug data seeding | CSV → Supabase `drugs` row ingestion | `scripts/seed_drugs.js` |

## Pattern Overview

- **Two-process system:** a React Native (Expo) app and a separate Node/Express backend live in the same repo but ship independently. Mobile never touches Gemini keys directly — all AI calls are proxied through `backend/server.js`.
- **File-based routing:** every screen is a file under `app/`; `_layout.tsx` files configure navigation at each level.
- **Server-side RAG:** the backend pulls context from two external knowledge sources (HuggingFace medical dataset + Europe PMC literature), injects them into a templated Gemini prompt, and returns a structured reply plus citations.
- **Custom delimited protocol:** AI replies use `##SECTION## ... ##END##` markers that the mobile client parses into styled cards via `SECTION_CONFIG`.
- **Shared specialty template:** seven specialty routes delegate fully to one `CategoryPage` component.
- **Styling via NativeWind** (Tailwind on RN) with an OKLCH brand palette (`turquoise`, gold, neutral graphite ramp) defined in `tailwind.config.js`.
- **Typed Supabase** client (`createClient<Database>`) but auth/profile features are currently dormant (`useUserProfile` returns mocked state).

## Layers

- Purpose: Render content, manage local UI state, navigate
- Location: `app/**/*.tsx`
- Contains: Route components, header/bar components, inline sub-components
- Depends on: `services/aiService`, `hooks/useUserProfile`, `components/CategoryPage`, `router.push`
- Used by: Expo Router
- Purpose: Reusable UI building blocks shared across route groups
- Location: `components/`
- Contains: `CategoryPage.tsx` (and future shared components)
- Depends on: `expo-router` (navigation), `@expo/vector-icons`, NativeWind classes
- Used by: Specialty routes under `app/<specialty>/index.tsx`
- Purpose: Wrap external I/O so screens stay declarative
- Location: `services/`, `lib/`, `hooks/`
- Contains: `aiService.ts`, `supabase.ts`, `useUserProfile.ts`
- Depends on: `@supabase/supabase-js`, `AsyncStorage`, fetch
- Used by: Screens in `app/`
- Purpose: Shared TypeScript types for database schema
- Location: `types/`
- Contains: `supabase.ts` (`Database` interface, Row/Insert/Update per table)
- Depends on: nothing
- Used by: `lib/supabase.ts`, `hooks/useUserProfile.ts`
- Purpose: Aggregate external knowledge sources, generate AI answer, normalize output
- Location: `backend/server.js`
- Contains: Express routes, prompt builders, knowledge fetchers, Gemini wrapper, section scrubber
- Depends on: `@google/generative-ai`, `express`, `cors`, `dotenv`
- Used by: `services/aiService.ts` via HTTP
- Purpose: Out-of-band data ops against Supabase (CSV seed, search-query updates, smoke tests)
- Location: `scripts/`
- Depends on: `@supabase/supabase-js`, `.env` (inline parser)
- Used by: Developers running them manually

## Data Flow

### Primary Request Path — Clinical Chat

### Secondary Flow — Specialty → Chat Navigation

### Secondary Flow — Drug Data Seeding (offline)

- Local component `useState` only — no global store (no Redux, Zustand, Context provider)
- `messages` array is the entire chat state (`app/(tabs)/ChatTab.tsx:436`)
- `selectedCategory` persists per ChatTab mount only (no persistence to AsyncStorage)
- Supabase session would be auto-refreshed by `AppState` listener in `lib/supabase.ts:34-40` once re-enabled

## Key Abstractions

- Purpose: Routes chat to a specialized AI persona + targeted retrieval
- Examples: `'physicians' | 'dentists' | 'physiotherapy'`; defined in `services/aiService.ts:4` and used in `app/(tabs)/ChatTab.tsx:60-64`
- Pattern: Union type passed through the HTTP body to backend persona selection
- Purpose: Let the backend author content sections that the client renders as styled cards
- Examples: Backend writes `##MANAGEMENT PROTOCOL##\n...\n##END##`; client parses into `MedicalSection[]` (`backend/server.js:251-265`, `app/(tabs)/ChatTab.tsx:205-229`)
- Pattern: Custom text-encoded schema validated against `APPROVED_HEADINGS` server-side and matched against `SECTION_CONFIG` client-side
- Purpose: Surface peer-reviewed PubMed references tied to the AI answer
- Examples: `services/aiService.ts:6-13`; built from EuropePMC results in `backend/server.js:78-86`; rendered in `app/(tabs)/ChatTab.tsx:383-401`
- Purpose: Avoid SSR-init issues on web while keeping the `import { supabase } from 'lib/supabase'` ergonomic everywhere
- Examples: `lib/supabase.ts:11-44` (singleton getter) and `lib/supabase.ts:47-54` (proxy that forwards reads to the live client)
- Purpose: Generic-typed Supabase query builder
- Examples: `types/supabase.ts:9-169` defines Row/Insert/Update for `profiles`, `drugs`, `user_favorites`, `drug_database`
- Pattern: Pass to `createClient<Database>(...)` so all table access is statically checked

## Entry Points

- Location: `package.json` → `"main": "expo-router/entry"` (`package.json:3`)
- Triggers: `npm start` / `npx expo start`
- Responsibilities: Boots Metro, mounts Expo Router root, finds `app/_layout.tsx`
- Location: `backend/server.js:283-290`; `backend/package.json:6-8`
- Triggers: `npm start` (or `npm run dev` with Nodemon) from `backend/`
- Responsibilities: Listen on `0.0.0.0:3001`, expose `/health` and `/api/chat`, init Gemini client
- Location: `scripts/*.js`, each its own CLI (e.g. `scripts/seed_drugs.js`)
- Triggers: `node scripts/<name>.js`
- Responsibilities: One-shot data or connectivity operations

## Architectural Constraints

- **Two package.jsons:** mobile and backend live at different paths and must be installed separately (`npm install` at root + at `backend/`). The two `node_modules/` trees are independent.
- **No shared code between mobile and backend:** mobile is TS/React-Native-only, backend is CommonJS Node. Types are not exported from backend; the mobile `types/supabase.ts` is hand-maintained rather than generated.
- **Threading:** Mobile runs on React Native JS thread + Reanimated worklets (animations in `ChatTab.tsx`, `app/(tabs)/_layout.tsx` use `react-native-reanimated`/`worklets`). Backend is single-threaded Express; AI calls are awaited sequentially per request (no worker pool).
- **Global state:** `supabaseInstance` in `lib/supabase.ts:11` is a module-level singleton — initialized once, then reused. No other module-level mutable state detected.
- **Backend single file:** `backend/server.js` (290 lines) contains all routes + helpers + prompt engineering. Refactor into `backend/routes/` + `backend/services/` before adding more endpoints (anti-pattern risk; see below).
- **Hardcoded backend URL:** `process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3001'` (`services/aiService.ts:1-2`). Mobile assumes the backend is reachable at that URL at all times — no service discovery, no retry beyond browser fetch.
- **Schema mismatch:** `types/supabase.ts` carries both camelCase (`trade_name`, `scientific_name`) and original PascalCase/quoted columns (`"Trade_name"`, `"Drugname"`, `"Price"`, `"Search Query"`) — reflecting that the live drugs table never got migrated to the cleaner schema in `setup-drugs-table.sql`.
- **Topic not threaded to chat:** `components/CategoryPage.tsx:67-71` discards the `query` argument — `handleStartConsultation` only `router.push('/(tabs)/ChatTab')` without params. The selected topic string never reaches `ChatTab`.
- **No persistence layer in mobile:** chat history, profile, favorites all in-memory or unused today. AsyncStorage is wired ONLY for Supabase auth storage (`lib/supabase.ts:21`); the chat `messages` array resets on unmount.
- **Circular imports:** None detected (mobile services → screen edges only; backend is a flat file).

## Anti-Patterns

### Backend god-file

### Mixed snake_case / PascalCase column keys in `types/supabase.ts`

### Throwaway router.push without params

### Hardcoded localhost fallback for backend URL

## Error Handling

- Mobile `aiService.sendMessageByText` returns a hardcoded `reply` string on any error: "I'm sorry, I'm having trouble connecting..." (`services/aiService.ts:33-45`). The caller never sees the exception, `citations` is simply omitted.
- ChatTab `handleTextSend` wraps the service call in try/catch/finally; `console.error(error)` then `setIsTyping(false)` (`app/(tabs)/ChatTab.tsx:500-507`). UI shows no toast/alert on failure.
- Backend `POST /api/chat` catches and returns `{ error: 'AI service error', reply: fallback }` with `500` (`backend/server.js:273-279`) — preserving the contract that mobile always gets a reply string.
- `callAI` retries Gemini with exponential backoff (1, 2, 4 sec) on failure, throws after 3 attempts (`backend/server.js:92-110`).
- Knowledge fetchers swallow exceptions and return `''` / `[]` (`backend/server.js:59`, `backend/server.js:87`); RAG silently degrades to "no external context" without failing the chat.

## Cross-Cutting Concerns

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

| Skill | Description | Path |
|-------|-------------|------|
| ui-ux-pro-max | UI/UX design intelligence. 50 styles, 21 palettes, 50 font pairings, 20 charts, 9 stacks. | `.agents/skills/ui-ux-pro-max/SKILL.md` |
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
