<!-- refreshed: 2026-08-04 -->
# Architecture

**Analysis Date:** 2026-08-04

## System Overview

```text
┌──────────────────────────────────────────────────────────────┐
│                    React Native (Expo) Mobile App              │
│                       Expo Router file-based routes            │
├───────────────────┬──────────────────────┬────────────────────┤
│  app/(tabs)/       │  app/(tabs)/          │  app/(tabs)/       │
│  index.tsx (Home) │  ChatTab.tsx (Chat)   │  profile.tsx        │
│  Orbit nav → 7    │  parseMedicalSections│  uses useUserProfile│
│  specialty routes  │  SECTION_CONFIG map  │  + mock profile     │
└────────┬──────────┴─────────┬────────────┴─────────┬──────────┘
         │ router.push()       │ fetch POST            │ profile read
         ▼                     ▼                       ▼
┌──────────────────────────────────────────────────────────────┐
│   app/<specialty>/index.tsx × 7  ← components/CategoryPage     │
│   heart, git, fever, neuro, skin, women, lungs                │
│   (thin wrappers; topics table inside CategoryPage)           │
└──────────────────────────────────────────────────────────────┘
         │
         ▼ (router.push('/(tabs)/ChatTab'))
┌──────────────────────────────────────────────────────────────┐
│              Mobile service / data layer                       │
│  services/aiService.ts  → chat HTTP client                     │
│  lib/supabase.ts        → lazy Supabase singleton (+proxy)     │
│  hooks/useUserProfile.ts→ profile state (mocked off)           │
│  types/supabase.ts      → Database typings (typed client)      │
└────────┬──────────────────────────────────────────┬───────────┘
         │ fetch POST /api/chat                       │ Supabase (paused)
         ▼
┌──────────────────────────────────────────────────────────────┐
│                 Backend Express Service                        │
│                      backend/server.js                         │
│  /health  /api/chat                                            │
│  • fetchMedicalKnowledge (HuggingFace datasets-server)         │
│  • fetchEuropePMC (Europe PMC REST search — citations)        │
│  • callAI → @google/generative-ai (Gemini Flash)               │
│  • persona prompt builder (physicians / dentists / physio)     │
│  • section scrubber (##SECTION## delimiters, approved list)    │
└────────┬────────────────────────────┬─────────────────────────┘
         │ HTTPS fetch                │ HTTPS fetch
         ▼                            ▼
┌──────────────────────┐  ┌────────────────────────┐  ┌─────────────┐
│ Gemini API           │  │ HuggingFace datasets   │  │ Europe PMC  │
│ (gemini-flash-latest)│  │ OpenMed Medical        │  │ REST search │
│                      │  │ Reasoning SFT Mega     │  │ (citations) │
└──────────────────────┘  └────────────────────────┘  └─────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Persisted backing store (currently dormant in mobile)         │
│  Supabase Postgres: profiles, drugs, user_favorites,          │
│                    drug_database (types in types/supabase.ts)  │
│  DDL: schema.sql, setup-drugs-table.sql                       │
│  Seeding: scripts/seed_drugs.js (CSV → Supabase drugs)        │
└──────────────────────────────────────────────────────────────┘
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

**Overall:** Expo Router (file-based route groups) + thin mobile service/hook layer + standalone backend façade + retrieval-augmented generation (RAG) over Gemini.

**Key Characteristics:**
- **Two-process system:** a React Native (Expo) app and a separate Node/Express backend live in the same repo but ship independently. Mobile never touches Gemini keys directly — all AI calls are proxied through `backend/server.js`.
- **File-based routing:** every screen is a file under `app/`; `_layout.tsx` files configure navigation at each level.
- **Server-side RAG:** the backend pulls context from two external knowledge sources (HuggingFace medical dataset + Europe PMC literature), injects them into a templated Gemini prompt, and returns a structured reply plus citations.
- **Custom delimited protocol:** AI replies use `##SECTION## ... ##END##` markers that the mobile client parses into styled cards via `SECTION_CONFIG`.
- **Shared specialty template:** seven specialty routes delegate fully to one `CategoryPage` component.
- **Styling via NativeWind** (Tailwind on RN) with an OKLCH brand palette (`turquoise`, gold, neutral graphite ramp) defined in `tailwind.config.js`.
- **Typed Supabase** client (`createClient<Database>`) but auth/profile features are currently dormant (`useUserProfile` returns mocked state).

## Layers

**Presentation (screens):**
- Purpose: Render content, manage local UI state, navigate
- Location: `app/**/*.tsx`
- Contains: Route components, header/bar components, inline sub-components
- Depends on: `services/aiService`, `hooks/useUserProfile`, `components/CategoryPage`, `router.push`
- Used by: Expo Router

**Shared components:**
- Purpose: Reusable UI building blocks shared across route groups
- Location: `components/`
- Contains: `CategoryPage.tsx` (and future shared components)
- Depends on: `expo-router` (navigation), `@expo/vector-icons`, NativeWind classes
- Used by: Specialty routes under `app/<specialty>/index.tsx`

**Mobile service / data access:**
- Purpose: Wrap external I/O so screens stay declarative
- Location: `services/`, `lib/`, `hooks/`
- Contains: `aiService.ts`, `supabase.ts`, `useUserProfile.ts`
- Depends on: `@supabase/supabase-js`, `AsyncStorage`, fetch
- Used by: Screens in `app/`

**Domain/types:**
- Purpose: Shared TypeScript types for database schema
- Location: `types/`
- Contains: `supabase.ts` (`Database` interface, Row/Insert/Update per table)
- Depends on: nothing
- Used by: `lib/supabase.ts`, `hooks/useUserProfile.ts`

**Backend façade:**
- Purpose: Aggregate external knowledge sources, generate AI answer, normalize output
- Location: `backend/server.js`
- Contains: Express routes, prompt builders, knowledge fetchers, Gemini wrapper, section scrubber
- Depends on: `@google/generative-ai`, `express`, `cors`, `dotenv`
- Used by: `services/aiService.ts` via HTTP

**Data scripts:**
- Purpose: Out-of-band data ops against Supabase (CSV seed, search-query updates, smoke tests)
- Location: `scripts/`
- Depends on: `@supabase/supabase-js`, `.env` (inline parser)
- Used by: Developers running them manually

## Data Flow

### Primary Request Path — Clinical Chat

1. User types in ChatTab input (keyboard handled) (`app/(tabs)/ChatTab.tsx:680-691`)
2. `handleTextSend(query)` calls `aiService.sendMessageByText(query, 'general', selectedCategory)` (`app/(tabs)/ChatTab.tsx:494-508`)
3. `aiService.sendMessageByText` issues `fetch POST ${BACKEND_URL}/api/chat` with `{message, mode, category}` (`services/aiService.ts:20-46`)
4. Backend `POST /api/chat` request handler fires (`backend/server.js:118`)
5. Backend fetches knowledge context: `fetchMedicalKnowledge(message)` from HuggingFace datasets-server (`OpenMed/Medical-Reasoning-SFT-Mega`) (`backend/server.js:28-62`)
6. Backend fetches citations: `fetchEuropePMC(message)` returns top 3 PubMed papers (`backend/server.js:64-90`)
7. Backend builds persona instruction from category (`physicians` / `dentists` / `physiotherapy`) (`backend/server.js:156-164`)
8. Backend assembles prompt with `##SECTION##`-delimited formatting rules and citation instruction (`backend/server.js:166-242`)
9. Backend calls Gemini via `callAI(prompt)` with exponential-backoff retry (`backend/server.js:92-110`)
10. Backend scrubber strips preamble, filters to `APPROVED_HEADINGS`, re-emits `##HEAD##\n…\n##END##` blocks (`backend/server.js:246-268`)
11. Backend responds `res.json({ reply, citations })` (`backend/server.js:272`)
12. Mobile `aiService` returns `{ reply, citations }` (`services/aiService.ts:37-41`)
13. `ChatTab` appends user + AI messages (`app/(tabs)/ChatTab.tsx:468-492`)
14. `ChatBubble` renders: `parseMedicalSections(text)` splits the reply into `##SECTION##` chunks (`app/(tabs)/ChatTab.tsx:205-229`), then each becomes a `MedicalSectionBox` colored by `SECTION_CONFIG` (`app/(tabs)/ChatTab.tsx:231-298`)

### Secondary Flow — Specialty → Chat Navigation

1. Home `OrbitButton` tapped (`app/(tabs)/index.tsx:124-128`)
2. `router.push(route)` to e.g. `/heart` (`app/(tabs)/index.tsx:126`)
3. Specialty route renders `<CategoryPage categoryName=…>` (`app/heart/index.tsx`)
4. Topic card or "Ask AI About X" CTA pressed (`components/CategoryPage.tsx:67-71`, `components/CategoryPage.tsx:100-126`)
5. `router.push('/(tabs)/ChatTab')` returns the user to the chat surface (note: the chosen topic string is currently NOT threaded into the chat; see Constraints)

### Secondary Flow — Drug Data Seeding (offline)

1. Developer runs `node scripts/seed_drugs.js`
2. Script parses `../.env` inline for `EXPO_PUBLIC_SUPABASE_URL` / `_ANON_KEY` (`scripts/seed_drugs.js:8-22`)
3. Reads CSV at `assets/data/database112024(Sheet1).csv` (`scripts/seed_drugs.js:31`)
4. Inserts rows into Supabase `drugs` table (typed via `types/supabase.ts`)

**State Management:**
- Local component `useState` only — no global store (no Redux, Zustand, Context provider)
- `messages` array is the entire chat state (`app/(tabs)/ChatTab.tsx:436`)
- `selectedCategory` persists per ChatTab mount only (no persistence to AsyncStorage)
- Supabase session would be auto-refreshed by `AppState` listener in `lib/supabase.ts:34-40` once re-enabled

## Key Abstractions

**DoctorCategory:**
- Purpose: Routes chat to a specialized AI persona + targeted retrieval
- Examples: `'physicians' | 'dentists' | 'physiotherapy'`; defined in `services/aiService.ts:4` and used in `app/(tabs)/ChatTab.tsx:60-64`
- Pattern: Union type passed through the HTTP body to backend persona selection

**Structured medical reply protocol (`##SECTION##` delimiters):**
- Purpose: Let the backend author content sections that the client renders as styled cards
- Examples: Backend writes `##MANAGEMENT PROTOCOL##\n...\n##END##`; client parses into `MedicalSection[]` (`backend/server.js:251-265`, `app/(tabs)/ChatTab.tsx:205-229`)
- Pattern: Custom text-encoded schema validated against `APPROVED_HEADINGS` server-side and matched against `SECTION_CONFIG` client-side

**Citation:**
- Purpose: Surface peer-reviewed PubMed references tied to the AI answer
- Examples: `services/aiService.ts:6-13`; built from EuropePMC results in `backend/server.js:78-86`; rendered in `app/(tabs)/ChatTab.tsx:383-401`

**Lazy Supabase singleton + Proxy:**
- Purpose: Avoid SSR-init issues on web while keeping the `import { supabase } from 'lib/supabase'` ergonomic everywhere
- Examples: `lib/supabase.ts:11-44` (singleton getter) and `lib/supabase.ts:47-54` (proxy that forwards reads to the live client)

**Typed database interface (`Database`):**
- Purpose: Generic-typed Supabase query builder
- Examples: `types/supabase.ts:9-169` defines Row/Insert/Update for `profiles`, `drugs`, `user_favorites`, `drug_database`
- Pattern: Pass to `createClient<Database>(...)` so all table access is statically checked

## Entry Points

**Mobile app entry:**
- Location: `package.json` → `"main": "expo-router/entry"` (`package.json:3`)
- Triggers: `npm start` / `npx expo start`
- Responsibilities: Boots Metro, mounts Expo Router root, finds `app/_layout.tsx`

**Backend service entry:**
- Location: `backend/server.js:283-290`; `backend/package.json:6-8`
- Triggers: `npm start` (or `npm run dev` with Nodemon) from `backend/`
- Responsibilities: Listen on `0.0.0.0:3001`, expose `/health` and `/api/chat`, init Gemini client

**Script entry points:**
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

**What happens:** Every route, helper, prompt template and external integration lives in one 290-line `backend/server.js`.
**Why it's wrong:** As soon as a second endpoint (`/api/specialties`, `/api/drugs`, auth) lands, prompt construction and knowledge fetching become impossible to locate or test in isolation.
**Do this instead:** Split into `backend/src/routes/chat.js`, `backend/src/services/knowledge.js` (`fetchMedicalKnowledge` + `fetchEuropePMC`), `backend/src/services/ai.js` (`callAI`, persona builder), `backend/src/server.js` for wiring. Keep `server.js` as just `app.use`/listen.

### Mixed snake_case / PascalCase column keys in `types/supabase.ts`

**What happens:** The `drugs` Row type exposes both `trade_name: string | null` AND `"Trade_name": string | null`, plus `"Drugname"`, `"Price"`, `"Search Query"`, `"Price Changed"`, `"Region"`, `"Category"` (`types/supabase.ts:46-72`).
**Why it's wrong:** Two parallel shapes for the same data force every consumer to choose one path; downstream queries silently pick the wrong field; `setup-drugs-table.sql` shows the intended clean form was never applied.
**Do this instead:** Migrate the live table to the `setup-drugs-table.sql` schema, regenerate `types/supabase.ts` from the migrated Postgres (Supabase CLI `gen types`), delete both PascalCase variants from the type.

### Throwaway router.push without params

**What happens:** `components/CategoryPage.tsx:68-70` accepts `query` then `router.push({ pathname: '/(tabs)/ChatTab' })` with no `params`. The selected topic never pre-fills the chat.
**Why it's wrong:** The user taps "Acute Myocardial Infarction" and lands on an empty composer — the clinician's intent is dropped on the floor.
**Do this instead:** `router.push({ pathname: '/(tabs)/ChatTab', params: { q: query } })` and have `ChatTab` read `useLocalSearchParams<{q?: string}>()` to seed `inputText` on mount, optionally auto-send.

### Hardcoded localhost fallback for backend URL

**What happens:** `services/aiService.ts:1-2` falls back to `http://localhost:3001` when `EXPO_PUBLIC_BACKEND_URL` is unset.
**Why it's wrong:** Production builds silently point at a non-existent local backend. The user sees "I can't reach the medical AI server" with no actionable error.
**Do this instead:** Make the env var required at build time (Expo public env vars are inlined), and surface a banner in ChatTab when the flag is the localhost fallback — or better, fail the build when `EXPO_PUBLIC_BACKEND_URL` is unset in a production build profile.

## Error Handling

**Strategy:** Defensive try/catch with friendly user-visible fallback strings; no global error boundary.

**Patterns:**
- Mobile `aiService.sendMessageByText` returns a hardcoded `reply` string on any error: "I'm sorry, I'm having trouble connecting..." (`services/aiService.ts:33-45`). The caller never sees the exception, `citations` is simply omitted.
- ChatTab `handleTextSend` wraps the service call in try/catch/finally; `console.error(error)` then `setIsTyping(false)` (`app/(tabs)/ChatTab.tsx:500-507`). UI shows no toast/alert on failure.
- Backend `POST /api/chat` catches and returns `{ error: 'AI service error', reply: fallback }` with `500` (`backend/server.js:273-279`) — preserving the contract that mobile always gets a reply string.
- `callAI` retries Gemini with exponential backoff (1, 2, 4 sec) on failure, throws after 3 attempts (`backend/server.js:92-110`).
- Knowledge fetchers swallow exceptions and return `''` / `[]` (`backend/server.js:59`, `backend/server.js:87`); RAG silently degrades to "no external context" without failing the chat.

## Cross-Cutting Concerns

**Logging:** `console.log` / `console.error` everywhere — no logging framework. Backend logs request category and citation count on success (`backend/server.js:270`); errors log as `[AI service error: ...]`.

**Validation:** Manual only. `POST /api/chat` returns `400` if `message` missing (`backend/server.js:120`). No Zod/Joi/Pydantic layer. Mobile does not validate inputs before sending.

**Authentication:** Supabase Auth is wired (`lib/supabase.ts`) — `AsyncStorage`-backed sessions, `startAutoRefresh()` on app foreground — but `useUserProfile` currently returns mocked null state (`hooks/useUserProfile.ts:13-17`). Effectively **no auth is enforced end-to-end**; the Profile screen renders a stub "Alex Doe".

**Styling:** NativeWind (Tailwind on RN) via `babel-preset-expo` + `nativewind/babel` + `metro.config.js`. Brand palette is in `tailwind.config.js` (OKLCH tokens). One global stylesheet (`app/global.css`) imports `@tailwind base/components/utilities`.

**Secret management:** Gemini key only lives in `backend/.env` and is read server-side (`backend/server.js:11`). Mobile reads only public env (`EXPO_PUBLIC_*`) per Expo convention. `.env` files at both roots are gitignored — never read or log their contents.

**Internationalization:** None. The chat prompt's `LANGUAGE RULE` instructs Gemini to match English or Arabic on the AI side (`backend/server.js:213`, `backend/server.js:229`), but no client-side i18n.

---

*Architecture analysis: 2026-08-04*