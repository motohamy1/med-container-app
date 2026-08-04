# External Integrations

**Analysis Date:** 2026-08-04

## APIs & External Services

This app has a split-brain architecture: the mobile client talks to a self-hosted Express proxy, and the proxy fans out to three public medical/AI services. The mobile client never calls Gemini, HuggingFace, or EuropePMC directly in production paths.

### Own Backend (Express API proxy)
- **Service:** `med-arena-backend` — `backend/server.js`
- **Purpose:** Keeps Gemini API key off the device; one POST endpoint orchestrates RAG (retrieval-augmented generation) over two medical sources, prompts Gemini, and post-processes the structured reply.
- **Client (mobile):** `services/aiService.ts` — `aiService.sendMessageByText(message, mode, category)` POSTs to `${BACKEND_URL}/api/chat`
- **Base URL:** `process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3001'` (`services/aiService.ts:2`)
- **Auth:** None (open endpoint; CORS wide open via `app.use(cors())` with no allowlist — `backend/server.js:7`)
- **Endpoints:**
  - `POST /api/chat` — body `{ message, mode?: 'general'|'fast_recap', category?: 'physicians'|'dentists'|'physiotherapy' }` → returns `{ reply: string, citations: Citation[] }` (`backend/server.js:118`)
  - `GET /health` — returns `{ status: 'ok' }` (`backend/server.js:115`)
- **Audio:** `aiService.processAudio()` is a hard-coded stub returning `'(Audio processing unavailable)'` (`services/aiService.ts:48`) — voice input is declared in the UI but not wired through the backend.

### Google Gemini (Generative AI)
- **Service:** Google Generative AI — `@google/generative-ai` ^0.24.1
- **SDK/Client:** `GoogleGenerativeAI` instantiated in `backend/server.js:17` with `GEMINI_API_KEY`
- **Model:** `gemini-flash-latest` (resolved at runtime by Google; `scripts/test_gemini.js` falls back to `gemini-1.5-flash` if the alias fails)
- **Generation config:** `temperature: 0.3`, `maxOutputTokens: 2048` (`backend/server.js:20–23`)
- **Auth:** `GEMINI_API_KEY` env var in `backend/.env`; falls back to `EXPO_PUBLIC_GEMINI_API_KEY` (shared with root `.env`) — `backend/server.js:11`
- **Retry:** `callAI(prompt, retries=3)` with exponential backoff (`Math.pow(2, attempt+1) * 1000` ms) — `backend/server.js:92–110`
- **Mobile-side usage of SDK:** `scripts/test_gemini.js` invokes `@google/generative-ai` directly from Node for a connectivity diagnostic. The mobile bundle no longer calls Gemini directly (it routes via the backend), but `@google/generative-ai` remains in the root `package.json`.

### HuggingFace Datasets Server (medical knowledge retrieval)
- **Service:** `https://datasets-server.huggingface.co/search` — anonymous, no auth
- **Dataset:** `OpenMed/Medical-Reasoning-SFT-Mega`, config `default`, split `train`
- **Used in:** `fetchMedicalKnowledge(query)` — `backend/server.js:28–62`
- **Behavior:** Searches the dataset for `query`, takes the first 2 rows, extracts `user`/`assistant` message pairs, truncates assistant content to 2000 chars, and assembles a `### SPECIALIZED CLINICAL KNOWLEDGE BASE` context block. Empty result on error (swallowed `catch {}`).

### Europe PMC (peer-reviewed literature)
- **Service:** `https://www.ebi.acc.uk/europepmc/webservices/rest/search` — anonymous REST, no auth
- **Used in:** `fetchEuropePMC(query)` — `backend/server.js:64–90`
- **Params:** `query`, `format=json`, `resultType=core`, `pageSize=3`
- **Behavior:** Maps top 3 results to a citation object `{ id, title, author, journal, year, abstract, url }`. Only entries with an `abstractText` are kept. Abstracts are stripped of `<b|i|p|sup|sub>` tags. URL is built as `https://europepmc.org/article/MED/${pmid}`. These become the `[1]`, `[2]`, `[3]` bracketed citations emitted in the AI prompt and surfaced to the UI as `Citation[]`.

### RAG pipeline order (per `/api/chat` request)
1. Receive `{ message, mode, category }`
2. `fetchMedicalKnowledge(message)` → HF dataset snippets (best-effort, may be empty)
3. `fetchEuropePMC(message)` → up to 3 PubMed abstracts
4. concatenate both into a `### SPECIALIZED CLINICAL KNOWLEDGE BASE` + `### PEER-REVIEWED MEDICAL LITERATURE (EUROPE PMC)` prompt block (`backend/server.js:124–154`)
5. Select persona instruction by `category` (`physicians` / `dentists` / `physiotherapy`) — `backend/server.js:156–164`
6. Build mode-specific prompt (`general` vs `fast_recap`) enforcing a strict `##SECTION##`/`##END##` delimiters format and forbidding asterisks / markdown bold — `backend/server.js:166–242`
7. `callAI(prompt)` → Gemini
8. Scrub reply: slice from first `##`, split on `/##(.*?)##/`, keep only headings in an `APPROVED_HEADINGS` allowlist, re-emit as `##HEADING##\n<content>\n##END##` — `backend/server.js:247–268`
9. Respond `{ reply, citations }`

## Data Storage

### Databases
- **Provider:** Supabase (Postgres + Auth), hosted
- **Client (mobile):** `@supabase/supabase-js` ^2.90.1, initialized lazily in `lib/supabase.ts`
  - `getSupabaseClient()` — singleton with `AsyncStorage` session storage, `autoRefreshToken: true`, `persistSession: true`, `detectSessionInUrl: false`
  - Wired to refresh on `AppState === 'active'` via `auth.startAutoRefresh()` / `stopAutoRefresh()` (`lib/supabase.ts:34–40`)
  - Exposed as a `Proxy` named `supabase` for backwards-compatible access — `lib/supabase.ts:47`
  - Guards against SSR/web with `typeof window !== 'undefined' || Platform.OS !== 'web'` test
  - Requires `react-native-url-polyfill/auto` import (`lib/supabase.ts:4`)
- **Client (scripts):** `scripts/{seed_drugs,check_data,update_search_query,update_search_query_batch}.js` each spin up their own `createClient` with the anon key
- **Connection env:** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (root `.env`)
- **ORM/Query:** Raw supabase-js query builder (`.from('drugs').select(...)`, `.upsert()`, `.insert()`, `.delete()`). No Drizzle, Prisma, or Kysely.

### Schema (DDL lives in repo, executed manually in Supabase SQL editor)
- `schema.sql` — canonical schema:
  - `profiles` (PK `id uuid references auth.users`, RLS on, public SELECT, self INSERT/UPDATE)
  - `drugs` (PK `id uuid default gen_random_uuid()`, RLS on, public SELECT)
  - `user_favorites` (composite PK `(user_id, drug_id)`, FK to `profiles` and `drugs`, RLS restricted to owner)
- `setup-drugs-table.sql` — alternate "clean" drugs table with quoted CSV-mapped columns (`"Active_ingredient"`, `"Trade_name"`, `"Category"`, `"Search Query"`, plus a legacy empty `""` column to absorb a trailing comma in the source CSV) and legacy fallback columns (`trade_name`, `active_ingredients text[]`). Includes `DROP TABLE IF EXISTS drugs CASCADE` — destructive.
- `types/supabase.ts` — hand-written `Database` type reflecting the merged schema (quoted columns + legacy snake_case columns side by side). Not regenerated from Supabase.

### Tables in use
- `profiles` — user profile, joined to `auth.users`
- `drugs` — drug reference (mixed-case columns: `"Trade_name"`, `"Drugname"`, `"Active_ingredient"`, `"Price"`, `"Form"`, `"Category"`, `"Search Query"`, `"Date"`, `"Price_prev"`, `"Price Changed"`, `"Region"`; legacy snake_case: `trade_name`, `scientific_name`, `price`, `currency`, `manufacturer`, `description`, `image_url`, `active_ingredients text[]`, `dosage_form`, `strength`)
- `user_favorites` — drug favorites keyed by `(user_id, drug_id)`
- `drug_database` — type-level alias of `drugs` (`types/supabase.ts:154`); `scripts/check_data.js` queries `drug_database` directly, suggesting a view of that name may exist in Supabase (not in the committed DDL)

### File Storage
- Local filesystem only — no S3, R2, GCS, or Supabase Storage integration detected. Splash/icon assets are bundled into the app (`assets/images/`).

### Caching
- None. No Redis, no MMKV, no in-memory cache. The Express backend re-fetches HF dataset + EuropePMC on every `/api/chat` request. The mobile chat holds messages only in component state (`useState`) — no persistent chat history.

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (configured in `lib/supabase.ts` with `autoRefreshToken`, `persistSession`, `AsyncStorage` session storage)
- Schema enforces RLS: `profiles` and `user_favorites` policies reference `auth.uid()`
- **Current state:** Auth is wired but **deactivated in the UI**. `hooks/useUserProfile.ts` returns mock/null values — `useEffect` body is a no-op with a comment "Supabase is disabled for now". No sign-in / sign-up screen exists. Profile screen shows a hard-coded "Alex Doe" placeholder and a non-functional "Log Out" button.

**Implementation:**
- Lazy singleton Supabase client, session auto-refresh on `AppState === 'active'`, `AsyncStorage` persistence
- The `supabase` export is a `Proxy` that forwards property access to the lazily-initialized instance (`lib/supabase.ts:47`)

## Monitoring & Observability

**Error Tracking:**
- None. No Sentry, Bugsnag, Crashlytics, DataDog, or `expo-application-usage` integration.

**Logs:**
- Mobile: `console.error` / `console.log` only (e.g., `services/aiService.ts:33,43`, `app/(tabs)/ChatTab.tsx:504`)
- Backend: `console.error` / `console.log` for attempt failures, response summaries, and startup banner (`backend/server.js:102,270,274,284`)
- No structured logging library (no `pino`, `winston`, `morgan`)

## CI/CD & Deployment

**Hosting:**
- Mobile: Expo EAS (implied by Expo SDK 57 setup; no `eas.json` committed). No CI workflow files (`.github/workflows/`, `.gitlab-ci.yml`, `circleci/`) detected.
- Backend: node process; deployment target undocumented. No Dockerfile, no `Procfile`, no `render.yaml`/`fly.toml`/`vercel.json` in repo.

**CI Pipeline:**
- None detected

## Environment Configuration

**Required env vars (root `.env` — consumed by Expo + scripts):**
- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL (`lib/supabase.ts:7`)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key (`lib/supabase.ts:8`)
- `EXPO_PUBLIC_BACKEND_URL` — backend base URL (defaults to `http://localhost:3001`; `services/aiService.ts:2`)
- `EXPO_PUBLIC_GEMINI_API_KEY` — Gemini key; read by backend as a fallback (`backend/server.js:11`) and by `scripts/test_gemini.js`

**Required env vars (`backend/.env`):**
- `GEMINI_API_KEY` — primary Gemini key for the backend (`backend/server.js:11`)
- `PORT` — optional; defaults to 3001 (`backend/server.js:10`)

**Secrets location:**
- `.env` (repo root) and `backend/.env` — both gitignored (`.gitignore:34–37`). No secrets manager, no `.env.example` committed, no Vault/Sops. The mobile client must NOT ship `GEMINI_API_KEY` — the backend exists specifically to keep it off the device (see `backend/package.json` description: "keeps API keys off the device"). The cross-fallback in `server.js:11` (`process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY`) is a footgun: if `EXPO_PUBLIC_GEMINI_API_KEY` is set in the mobile bundle for `scripts/test_gemini.js`, that same key could leak into the client — keep it out of the Expo build.

## Webhooks & Callbacks

**Incoming:**
- None. The Express server exposes only `GET /health` and `POST /api/chat`. No Stripe/Supabase/Slack webhook handlers.

**Outgoing:**
- None. The backend makes outbound calls to HuggingFace and EuropePMC but does not push events to any external webhook.

## Known Integration Risks

- **Wide-open CORS** on the backend (`app.use(cors())` with no origin allowlist, `backend/server.js:7`) — any web origin can call `/api/chat` and burn Gemini quota.
- **No rate limiting** on `/api/chat` — every request triggers 2 outbound HTTP fetches (HF + EuropePMC) plus a Gemini call.
- **Unauthenticated AI proxy** — `/api/chat` accepts any request with no auth/key; abuse vector for the above.
- **Swallowed errors** in `fetchMedicalKnowledge` and `fetchEuropePMC` (`catch {}` returns `''`/`[]`) — silent failures degrade response quality without surfacing in logs or UI.
- **Audio stub** — `aiService.processAudio` always returns "unavailable" (`services/aiService.ts:48`); UI may imply voice support that does not work.
- **Auth dormant** — Supabase Auth is bootstrapped but `useUserProfile` no-ops, so any feature gated on `userId` (favorites, RLS writes) is effectively dead.
- **Shared Gemini key fallback** — `backend/server.js:11` falls back to `EXPO_PUBLIC_GEMINI_API_KEY`, risking the mobile bundle shipping the key if that env var is populated at build time.

---

*Integration audit: 2026-08-04*