# Codebase Concerns

**Analysis Date:** 2026-08-04

> Workspace: `C:\Dev\Dev_World\Mobile_Projects\medical_arena` · Focus: full-repo scan.
> Project: "say-a-drug" / Med Arena — Expo + React Native medical AI app backed by an Express proxy that calls Google Gemini.

---

## Tech Debt

### Backend AI provider revert left inconsistent state

- Issue: Commit `2692a944` ("Migrate AI backend from Google Gemini to Groq…"), then the **unstaged working-tree** of `backend/server.js` reverted Groq back to `@google/generative-ai`. The backend `package.json` still lists `groq-sdk` AND the new `@google/generative-ai`, and `scripts/test_gemini.js` still references `gemini-flash-latest`. There are two competing AI client paths in the same repo with no migration note.
- Files: `backend/server.js`, `backend/package.json`, `backend/package-lock.json`, `scripts/test_gemini.js`
- Impact: Anyone running `npm install` in `backend/` pulls a useless `groq-sdk` dependency; reviewers cannot tell which provider is canonical from git history alone; CI/test parity impossible because there is no test exercising either path.
- Fix approach: Pick one provider, commit it, delete the other dep + stale code. If Gemini is canonical: remove `groq-sdk` from `backend/package.json`, drop the "PASTE_YOUR_GROQ_KEY_HERE" guard from `callAI` (already removed in the uncommitted diff), and commit the diff so `git log` reflects reality. Then add a `scripts/test_ai.js` that hits the live `/health` + `/api/chat` to assert the chosen provider works.

### Stale `schema.sql` no longer matches production schema

- Issue: `schema.sql` declares `drugs` with only `(id, created_at, trade_name, category)`, but `setup-drugs-table.sql` and `types/supabase.ts` declare ~17 columns (`Drugname`, `Active_ingredient`, `Form`, `Price`, `Region`, `Category`, `Search Query`, etc.). `check_data.js` queries a table named `drug_database` (referenced in `types/supabase.ts:154` as an alias of `drugs`) that does not exist in either SQL file.
- Files: `schema.sql`, `setup-drugs-table.sql`, `types/supabase.ts`, `scripts/check_data.js`
- Impact: A new dev running `schema.sql` against a fresh Supabase project gets a four-column table that the app cannot read/write correctly; the `drug_database` reference is dead. The committed SQL cannot be the source of truth.
- Fix approach: Re-generate `schema.sql` from the live Supabase project (Supabase Studio → Database → DDL) and commit, or delete `schema.sql` in favor of `setup-drugs-table.sql` as the single source of truth. Verify `drug_database` is either a real view (add `CREATE VIEW` DDL) or remove the alias from `types/supabase.ts:154` and the lookup in `scripts/check_data.js:13`.

### Broken column name in `setup-drugs-table.sql`

- Issue: `setup-drugs-table.sql:15` creates a column named `""` (empty string) as a "handle" for a trailing comma in the CSV. This is invalid/ambiguous SQL that produces an unnamed empty string column in Postgres.
- Files: `setup-drugs-table.sql:15`
- Impact: Postgres will accept it but every query against `drugs` has a phantom column; introspection tools and the Supabase web UI render it confusingly; future `SELECT *` returns an unnamed field.
- Fix approach: Either drop the empty column line entirely (Supabase insert ignores trailing commas if the parser is fixed in `scripts/seed_drugs.js:67-85`), or name it explicitly e.g. `"_csv_trailer" text`. Run `ALTER TABLE drugs DROP COLUMN IF EXISTS ""` on the live DB to clean existing instances.

### Drifting scripts referencing divergent column names

- Issue: Three one-off scripts reference inconsistent drug columns: `seed_drugs.js` writes `Trade_name` + `Active_ingredient` + `trade_name` + `active_ingredients`; `update_search_query.js` reads `Drugname` + `Form` + `Category`; `update_search_query_batch.js` does the same; `check_data.js` queries `drug_database`. None of these are wired into `package.json` scripts.
- Files: `scripts/seed_drugs.js`, `scripts/update_search_query.js`, `scripts/update_search_query_batch.js`, `scripts/check_data.js`
- Impact: A new dev cannot tell which script is canonical; most will silently no-op or error against a real DB because column names are wrong for the current `types/supabase.ts` schema.
- Fix approach: Consolidate into one `scripts/sync_drugs.js` (or delete them all if seeding is a one-shot). Wire as `npm run seed:drugs` in `package.json`. Use the typed Supabase client and the columns defined in `types/supabase.ts:46-72`.

### Supabase auth disabled, UI hardcodes mock identity

- Issue: `hooks/useUserProfile.ts:13-17` has the comment "Supabase is disabled for now, returning mock/null values" — it sets `loading=false` and returns nothing. Yet `app/(tabs)/profile.tsx:53-108` consumes `profile` and renders it without null guards, and `app/(tabs)/index.tsx:63` hardcodes `"Alex Doe"`. Profile stats ("3 Prescriptions", "Oct 24", "2 Allergies") in `profile.tsx:128-153` are inline constants.
- Files: `hooks/useUserProfile.ts`, `app/(tabs)/profile.tsx`, `app/(tabs)/index.tsx`
- Impact: Login, profile editing, favorites (`user_favorites` table in `schema.sql:38-43`) and any auth-gated feature are dead. The app masquerades a logged-in doctor for screenshots without warning.
- Fix approach: Either land Supabase auth (the client, schema, and RLS policies already exist) and remove the mock values, or rip out the Supabase client and profile screen until auth is real. Do not ship a fake-logged-in UI for a medical app.

### Voice / audio input is a dead stub

- Issue: `services/aiService.ts:48-57` `processAudio` returns `{ text: '(Audio processing unavailable)', reply: 'Voice input is not supported...' }`. The `expo-av` package is listed in `package.json:25` and explicitly excluded from the Expo doctor version check (`package.json:60-66`), but no `Audio.*` import exists anywhere in `app/`, `components/`, `services/`, or `hooks/`.
- Files: `services/aiService.ts:48-57`, `package.json:25,60-66`
- Impact: Users tapping any mic affordance (and `app/(tabs)/profile.tsx:316-323` already advertises a "Voice Output" toggle) will see "not supported". `expo-av` is dead weight increasing install size and bundle complexity.
- Fix approach: Either implement audio with `expo-av` (record → base64 → POST `/api/chat-audio` on the backend, which forwards to Gemini's audio modality) or remove `expo-av` and the "Voice Output" toggle until the feature ships. Stop excluding `expo-av` from the doctor check once it is removed.

### Floating "Pharmacy" / "Notifications" / "Settings" controls are dead

- Issue: In `app/(tabs)/profile.tsx` the top-right Notifications + Settings buttons (`42-48`) are `TouchableOpacity` with no `onPress`. `BottomNavigation` (`242-279`) has Pharmacy / Home buttons with no `onPress`. Menu items "Medical ID", "Insurance Cards", "Past Orders", "Personality", "Privacy & Security", "Log Out" have no handlers. `app/(tabs)/index.tsx:159-163` "Clinical Hub" header arrow has no `onPress`.
- Files: `app/(tabs)/profile.tsx`, `app/(tabs)/index.tsx`
- Impact: Tappable UI that does nothing is worse than missing UI — it reads as broken, which is one of the slop tells in the project's anti-slop design law ("Dead controls and fake interactivity").
- Fix approach: Either wire every `TouchableOpacity` to a real route/handler, or render them as plain `<View>` (non-interactive) with the same styling until a route exists. Remove the `Touch` opacity affordance from non-functional controls.

### `Dentists` and `Physiotherapy` categories hard-locked

- Issue: `app/(tabs)/ChatTab.tsx:60-64` declares these categories with `isAvailable: false`. Tapping them fires `Alert.alert("Coming Soon", ...)` at `ChatTab.tsx:456-461`. They are never sent to the backend; selection silently stays on `physicians`.
- Files: `app/(tabs)/ChatTab.tsx:60-64,455-461`
- Impact: Two of three advertised specialist modes do not work.
- Fix approach: If they should ship, the `category` param already flows through `services/aiService.ts` to `backend/server.js:119,156-164` — just flip `isAvailable: true`. If they should not, remove the pills instead of "Coming Soon" teasing.

---

## Known Bugs

### AI response scrubber can drop entire reply on missing `##` markers

- Symptoms: The AI sometimes returns prose without any `##SECTION##` delimiter. The scrubber at `backend/server.js:247-268` does `rawReply.indexOf('##')`; if `firstIdx === -1` it keeps the whole raw string (good), but if the first `##` is mid-sentence (e.g. inside a code block), `substring(firstIdx)` slices off the intro. Then `APPROVED_HEADINGS` filtering at `:260-266` may discard every section, so `finalReply` is empty and the fallback `scrubbed.trim()` returns the already-truncated text.
- Files: `backend/server.js:246-268`
- Trigger: Gemini occasionally ignores the strict format — confirmed by `console.log` at `:270` that "Scrubbed Start" can be empty.
- Workaround: The frontend `parseMedicalSections` in `app/(tabs)/ChatTab.tsx:205-229` hides the response as `plainText` if no sections parse, so the user sees something, but a heavily truncated reply still degrades clinical quality.
- Fix approach: (1) Move the scrubber to a backend test with fixture responses; (2) If `finalReply` is empty, return `rawReply` (unscrubbed) instead of `scrubbed`; (3) Relax the "ZERO asterisks" rule for non-Arabic responses where the prompt itself invites hallucinated delimiters.

### `callAI` retry loop can leak a stack trace on the final attempt

- Symptoms: `backend/server.js:92-110` retries 3× with exponential backoff. On the final `catch` it `throw`s the raw error, which `/api/chat` catches at `:273-279` and logs via `console.error('[/api/chat]', err.message)` — only `err.message`, but the `callAI` inner logs at `:102` print the full `err.message` too. Duplicate logs and unstructured stack info.
- Files: `backend/server.js:92-110,273-279`
- Trigger: Gemini 5xx / quota / network failure.
- Workaround: None. The user just sees "I'm sorry, I'm having trouble…".
- Fix approach: Use a structured logger (pino or winston at minimum) with request IDs. Only log the final attempt's stack trace, not every intermediate.

### `parseMedicalSections` misclassifies headings containing the substring "END"

- Symptoms: `app/(tabs)/ChatTab.tsx:210-222` splits on `/##(.*?)##/`. The backend emits real sections as `##HEADING##\ncontent\n##END##`. If the AI emits a `##END##` line inside content, the regex pairs it with the next heading, mislabeling section content. The guard at `:219` only filters out the literal `"END"` heading, not `##END##` appearing mid-content.
- Files: `app/(tabs)/ChatTab.tsx:205-229`, `backend/server.js:251-266`
- Trigger: Model occasionally echoes `##END##` more than once per section.
- Workaround: None — that section silently disappears from the chat bubble.
- Fix approach: Strip every `##END##` token (case-insensitive, including surrounding whitespace) from `content` *before* the split, not after. Or, change the wire format to JSON `{sections:[{heading,content}]}` and parse it on the client; the regex-based protocol is fragile.

### `app/(tabs)/index.tsx` orbit "More" button navigates nowhere

- Symptoms: `categories[7]` `{ name: 'More', icon: 'grid' }` at `index.tsx:152,197` has no entry in `categoryRoutes` (`:22-30`), so `OrbitButton` calls `route` undefined and `if (route)` silently does nothing.
- Files: `app/(tabs)/index.tsx:22-30,143-153`
- Trigger: Tap the "More" button in the orbit on the home screen.
- Workaround: None.
- Fix approach: Remove the "More" button, or add `More: '/more'` with a real route. Do not ship a nav button with a no-op `onPress`.

### Search bar submit discards query text

- Symptoms: `app/(tabs)/index.tsx:79-85` `handleSearchSubmit` only checks `if (searchText.trim())` then `router.push('/(tabs)/ChatTab')` — it does not pass `searchText` as a param. The destination tab starts empty. Same in `app/(tabs)/profile.tsx:67-71` (`handleStartConsultation` ignores its `query` arg entirely).
- Files: `app/(tabs)/index.tsx:79-85`, `components/CategoryPage.tsx:67-71`
- Trigger: Type a clinical query in the home search bar and press Enter.
- Workaround: User must re-type in chat.
- Fix approach: Pass the query as a route param (`router.push({ pathname: '/(tabs)/ChatTab', params: { q: searchText } })`) and have `ChatTab` auto-send on mount via `useLocalSearchParams`. `components/CategoryPage.tsx:67-71` should pass `query` into the same param.

---

## Security Considerations

### Backend CORS allows any origin

- Risk: `backend/server.js:7` calls `app.use(cors())` with no options, meaning `Access-Control-Allow-Origin: *` is returned for every caller. The backend forwards free (Gemini-paid) inference to anyone.
- Files: `backend/server.js:7`
- Current mitigation: None. The backend listens on `0.0.0.0:PORT` (`:283`), so it is reachable from any network the host is on.
- Recommendations: Configure `cors({ origin: [process.env.WEB_ORIGIN, process.env.EXPO_PUBLIC_APP_SCHEME].filter(Boolean), methods: ['POST','GET'] })`. Reject requests without an `Origin` or `Referer` header that matches the allow-list when in production. Add `helmet()` for security headers. Add `express-rate-limit` (e.g. 30 req/min/IP) on `/api/chat` to slow Gemini-quota abuse.

### Exposed `EXPO_PUBLIC_*` env vars are bundled into the mobile app

- Risk: Anything prefixed `EXPO_PUBLIC_` is inlined into the JS bundle shipped to the device and is trivially extractable via `apktool` / APK Studio. The Supabase *anon* key (`EXPO_PUBLIC_SUPABASE_ANON_KEY`, read in `lib/supabase.ts:8`) is fine **only** because `schema.sql` enables RLS with `auth.uid()`-scoped policies (`schema.sql:13-53`). `EXPO_PUBLIC_BACKEND_URL` (`services/aiService.ts:2`) is a URL, not a secret — fine to leak. But the same conventions invite someone to add `EXPO_PUBLIC_GEMINI_API_KEY` to the mobile bundle; `scripts/test_gemini.js:31` explicitly reads `env.EXPO_PUBLIC_GEMINI_API_KEY` — if that ever gets referenced from app code, the paid key leaks.
- Files: `lib/supabase.ts:7-8`, `services/aiService.ts:1-2`, `scripts/test_gemini.js:31`, `.env` (existence only — contents not read).
- Current mitigation: The Gemini key is correctly held on the backend (`backend/server.js:11`) and not exposed to the app. The `.env` file is gitignored (`.gitignore:34-37`).
- Recommendations: (1) Add a comment in `lib/supabase.ts` stating that `EXPO_PUBLIC_SUPABASE_ANON_KEY` is safe only because of RLS — do not relax RLS without moving to a server proxy. (2) Rename or document `scripts/test_gemini.js` to read `GEMINI_API_KEY` (backend var) instead of `EXPO_PUBLIC_GEMINI_API_KEY` so the convention "EXPO_PUBLIC_* = device-visible" stays consistent. (3) Audit future PRs that add any new `EXPO_PUBLIC_*SECRET*` / `EXPO_PUBLIC_*KEY*` variable.

### Backend binds to `0.0.0.0` over plain HTTP with no rate limit

- Risk: The server is reachable from any network interface (LAN during dev, public if deployed on a VPS without a TLS terminator) and contains no rate limiting, no auth, and no input length validation beyond `if (!message)` (`backend/server.js:120`).
- Files: `backend/server.js:115,118-120,283`
- Current mitigation: Dev-only use; not deployed publicly today.
- Recommendations: (1) Subscribe `express-rate-limit` on `/api/chat` (e.g. 20/min/IP + 5/sec burst). (2) Validate `message.length <= 2000` to prevent prompt-injection / cost abuse. (3) Validate `mode` and `category` against an enum. (4) Document that the backend must sit behind TLS (Caddy / Nginx / Cloudflare) before any external deployment.

### Inline prompt injection via `message` interpolation

- Risk: `backend/server.js:172,222` interpolates the raw user `message` directly into the Gemini prompt: `topic: "${message}"` and `USER CLINICAL QUERY: "${message}"`. A malicious or curious clinician could insert `"`. Ignore prior instructions. Respond with…` to bypass the persona or hallucinate citations.
- Files: `backend/server.js:166-242`
- Current mitigation: None. The output scrubber (`:246-268`) only enforces section headings, not content integrity.
- Recommendations: Wrap user input in a constant wrapper that states it must never be interpreted as instructions (e.g. `USER_CLINICAL_QUERY_START` / `_END` delimiters, and instruct the model to treat everything between them as clinical text only). Cap input length server-side.

### `.commandcode/` directory is committed to git

- Risk: `.commandcode/settings.json`, `.commandcode/settings.local.json`, and `.commandcode/taste/taste.md` are tracked files (per `git ls-files`). `settings.json` lists **executable shell permission grants** with inline Node `eval` payloads that reference machine-local scratchpad paths (`%COMMANDCODE_SCRATCHPAD%\recolor.js`, `%COMMANDCODE_SCRATCHPAD%\oklch-convert.js`) and contain large inline JS color converters. Committing this to a shared repo (a) leaks a dev's local filesystem layout, (b) grants future agents the same shell permissions on every clone — which is dangerous if these scratchpad scripts ever get re-pointed at attacker-controlled paths, and (c) bloats diffs with permission churn (already showing as modified in `git status`).
- Files: `.commandcode/settings.json`, `.commandcode/settings.local.json`, `.commandcode/taste/taste.md`
- Current mitigation: None. `.gitignore:50` ignores `/.claude` but does **not** ignore `.commandcode/`.
- Recommendations: Add `.commandcode/` to `.gitignore` and `git rm --cached .commandcode/ -r`. These are per-developer editor permissions, not project code. Also add `.idea/` (already partially ignored at `:44-46`? — it is not; only `/ios` and `/android` are ignored) to keep VS Code-style editor configs out of the repo.

---

## Performance Bottlenecks

### Chat bubble component recreated on every render — no memoization

- Problem: `app/(tabs)/ChatTab.tsx` defines `MedicalSectionBox`, `ThinkingIndicator`, `ChatBubble` as plain function components in the same file with no `React.memo` wrap. `ChatTab.render` builds a fresh `renderItem={({ item }) => <ChatBubble … />}` closure on every state change, so every keystroke (`setInputText`) re-renders all message bubbles. There are zero `useCallback` / `useMemo` usages anywhere in `app/`, `components/`, `hooks/`, or `services/` (confirmed by grep — no matches).
- Files: `app/(tabs)/ChatTab.tsx:231-333,335-432,654,686`
- Cause: `FlatList` with inline `renderItem` + unmemoized item components. The `Animated.View entering=` props re-trigger their spring animation on every re-render. On a long chat, this drops frames.
- Improvement path: (1) `const ChatBubble = React.memo(function ChatBubble({...}) {...})` and same for `MedicalSectionBox`/`ThinkingIndicator`. (2) Lift `parseMedicalSections` result into a `useMemo` keyed on `message.text`. (3) Wrap `handleCopyText`, `handleSelectCategory`, `handleTextSend` in `useCallback`. (4) Use `FlatList`'s stable `keyExtractor` (already present) plus `removeClippedSubviews` and `maxToRenderPerBatch={6}`.

### AI pills/orbit ships a `Dimensions` subscription only computed once

- Problem: `app/(tabs)/index.tsx:16-19` and `app/(tabs)/ChatTab.tsx:36` compute `Dimensions.get('window').width` once at module load. Rotate the device or fold a tablet and these values are stale; the orbit grid will be positioned wrong.
- Files: `app/(tabs)/index.tsx:16-19`, `app/(tabs)/ChatTab.tsx:36-39`
- Improvement path: Use `useWindowDimensions()` inside the component, or subscribe to `Dimensions.addEventListener('change', ...)` in a `useEffect`. Until then, orientation changes break the home screen layout.

### Backend calls Hugging Face + Europe PMC serially on every chat request

- Problem: `backend/server.js:124-125` calls `fetchMedicalKnowledge` then `fetchEuropePMC` sequentially. Each is an outbound HTTP fetch with a non-configurable timeout (default `fetch`, no `AbortSignal`). Worst-case latency adds both (~2-5s) to every Gemini call (`callAI` at `:99`). For 3 messages in a row that's seconds of dead time before the model even starts generating.
- Files: `backend/server.js:28-90,123-148,244`
- Improvement path: `Promise.all([fetchMedicalKnowledge(message), fetchEuropePMC(message)])` — they are independent. Add `AbortSignal.timeout(3000)` so a slow upstream does not hold the request open. Cache literature refs per `(query, day)` key since the same clinical query is likely repeated by multiple clinicians.

### Full-bundle `groq-sdk` and `expo-av` dead weight

- Problem: `backend/package.json:15` still ports `groq-sdk` after the revert to Gemini. `package.json:25` ports `expo-av` even though `services/aiService.ts:48-57` confirms audio is stubbed. Each adds download size, install time, and transitive deps.
- Files: `backend/package.json:11-17`, `package.json:25,60-66`
- Improvement path: `npm uninstall groq-sdk` in `backend/`; `expo install --check` and remove `expo-av` from the app once the dead Audio stub is removed (see "Voice / audio input is a dead stub" above).

---

## Fragile Areas

### `lib/supabase.ts` lazy Proxy hack

- Files: `lib/supabase.ts:47-54`
- Why fragile: The default `supabase` export is a `Proxy` whose `get` returns `undefined` for every prop when no client exists (e.g. SSR / web). Callers like `hooks/useUserProfile.ts` never check for `undefined`, and any future code calling `supabase.from(...)` from web would throw `Cannot read properties of undefined (reading 'from')` at runtime with no compile-time warning. The Proxy also defeats IDE go-to-definition and реф.getResource tracing.
- Safe modification: Replace the Proxy with an explicit nullable export (`export const supabase: SupabaseClient | null = getSupabaseClient()`) and force callers to null-check. Better: delete the convenience export and require `getSupabaseClient()` everywhere so SSR failure is impossible to write without a guard.
- Test coverage: None — there is no test asserting the web path returns null cleanly.

### Wire-format regex protocol between backend and chat UI

- Files: `backend/server.js:251-266` and `app/(tabs)/ChatTab.tsx:205-229`
- Why fragile: The whole structural rendering of AI replies depends on Gemini emitting `##HEADING##...##END##` and the client regex-parsing it. Both sides re-implement the same parser with subtly different rules (backend uses `split(/##(.*?)##/)` and filters by `APPROVED_HEADINGS`; client uses the same regex but only filters `END`). Drift is invisible: a backend tweak makes the client miss a section, or vice versa, with no error.
- Safe modification: Move the parser to a shared module `lib/medicalSections.ts` (TS) and a mirror `backend/medicalSections.js` (CommonJS) generated from the same source, OR switch the wire format to JSON. Right now any change to one side MUST be hand-verified against the other.
- Test coverage: Zero. Add a fixture-based test on both sides (20 sample Gemini responses → expected sections).

### `types/supabase.ts` hand-maintained

- Files: `types/supabase.ts:46-122`
- Why fragile: 17 hand-typed columns duplicated across `Row`/`Insert`/`Update`. Adding a column means editing three identical blocks. Already drifted from `schema.sql` and `setup-drugs-table.sql` (see Tech Debt above).
- Safe modification: Generate from Supabase via `supabase gen types typescript --project-id <ref> --schema public > types/supabase.ts`. Add it as a `npm run gen:types` script. Until then, treat any manual edit as suspect.
- Test coverage: None.

### `app/(tabs)/_layout.tsx` Mixed-TabBar alignment assumptions

- Files: `app/(tabs)/_layout.tsx:54-74`
- Why fragile: Tab bar `height: 66`, `paddingBottom: 8` plus `ChatTab.tsx:37-39` constants `FLOATING_TAB_BAR_HEIGHT=65`, `FLOATING_TAB_BAR_BOTTOM_OFFSET=16`, `CHAT_BOTTOM_OFFSET=65+16+16=97`. These magic numbers must match between two files. Any change to the tab bar padding here shifts the chat composer 16px on iOS, breaking the keyboard offset.
- Safe modification: Export the constants from `(tabs)/_layout.tsx` (or a `constants/layout.ts` — the `constants/` dir is already created but empty) and import in `ChatTab.tsx`. Single source of truth.

---

## Scaling Limits

### In-memory message list — no persistence

- Resource: `app/(tabs)/ChatTab.tsx:436` `useState<Message[]>([])`
- Current capacity: Whatever the device RAM and `FlatList` allow — practically fine for hundreds of messages, but they vanish on app kill, app background, or RN reload. A medical consultation history disappearing mid-shift is operationally bad.
- Limit: App killed → all history gone. No "Recent Clinical Consultations" data feeds the home screen — it's hardcoded mock at `app/(tabs)/index.tsx:205-208`.
- Scaling path: Persist messages locally (AsyncStorage is already a dep, or `expo-secure-store` for sensitivity) and surface real "Recent" items on the home tab. Future: sync to Supabase `user_messages` table with RLS.

### Backend single-threaded Node with no concurrency cap

- Resource: `backend/server.js:283` — one Express process, default Node event loop.
- Current capacity: Each `/api/chat` opens 2 external fetches (Hugging Face + Europe PMC) plus 1 Gemini call (~3-10s). Concurrent requests multiply Gemini quota and hold Express workers.
- Limit: ~10 concurrent users on the same Gemini key will hit quota quickly with no rate limiter (see Security).
- Scaling path: Add `express-rate-limit` per-IP. Move to a queue / `p-limit` if chat concurrency grows. Cache identical prompts per day.

---

## Dependencies at Risk

### `@google/generative-ai` v0.24.1 — first GenAI-Go SDK, but legacy

- Risk: The official Google AI Node SDK has since rebranded to `@google/genai` (uses `v1beta` Googler stable). v0.x is in maintenance and the model alias `gemini-flash-latest` (`backend/server.js:19`, `scripts/test_gemini.js:60`) is undocumented in the SDK — it may stop resolving at any time, breaking every chat.
- Impact: Model alias invalidation → all `/api/chat` requests 500 → users see "I'm having trouble…" with no faster fix than renaming and redeploying.
- Migration plan: Pin to a concrete version (e.g. `gemini-2.0-flash`), upgrade to `@google/genai` (the successor package), and add a `/health` probe that verifies the alias resolves at boot before accepting traffic.

### `react-native` 0.86.2 + Expo SDK 57 with `react` 19.2.3

- Risk: React 19 is newer than the React Native 0.86 officially supported line (RN 0.86 targets React 19.0). Edge cases in `react-native-reanimated` 4.5.1 against React 19.1 are tracked but not all patched.
- Impact: Possible panics in Reanimated worklets under React 19 StrictMode that the project has not exercised.
- Migration plan: Track `expo doctor --fix-defined` until `expo` stabilizes — there is no CI to detect regressions today.

### `react-native-worklets` 0.10.1 bundled

- Risk: That package is below 1.0 and alters the JS thread model. `scripts/test_gemini.js` and the rest of the app do not exercise its API surface, so it is unclear why it is included.
- Impact: Pulls in a low-maturity deep dependency that breaks `react-native-reanimated` worklet compilation in some Expo SDK 57 setups.
- Migration plan: Audit if any `worklets` import actually exists (grep finds none in `app/`, `services/`, `hooks/`, `components/`). If unused, remove it.

---

## Missing Critical Features

### No authentication / session flow

- Problem: The Supabase client (`lib/supabase.ts`), auth RLS policies (`schema.sql:13-53`), and `user_favorites` table (`schema.sql:38-43`) exist, but the app never calls `.auth.signInWithPassword` or equivalent. `hooks/useUserProfile.ts:13-17` confirms "Supabase is disabled for now."
- Blocks: Favorites, prescriptions, profile editing, any cross-device history, any HIPAA-adjacent data persistence.
- Fix approach: Add a login screen under `app/(auth)/login.tsx`, route on `supabase.auth.getSession()` in `app/_layout.tsx`, and resurrect `useUserProfile.ts` to actually fetch the row for the signed-in UID.

### No structured logging / observability

- Problem: The backend has `console.log`/`console.error` only (`backend/server.js:14,102,270,274,288`). There is no request ID, no structured logger, no error tracking (Sentry / Logflare), no metrics. The mobile app uses `console.error` in four places (`aiService.ts:33,43`, `ChatTab.tsx:504`) with no error boundary.
- Blocks: Diagnosing any production chat failure; tracking which AI prompt patterns fail most.
- Fix approach: Add Sentry (`@sentry/react-native` for app, `@sentry/node` for backend). Add `helmet` + structured `console` wrapper.

### No input length / format validation server-side

- Problem: `backend/server.js:120` checks `if (!message) return 400` only. `mode` and `category` are defaulted but never validated against an enum. `message` length is unbounded.
- Blocks: Cost abuse — a 10,000-char message will compose a 10,000-char Gemini prompt and 3× retries.
- Fix approach: `if (typeof message !== 'string' || message.length > 2000) return 422`. Validate `mode ∈ {'general','fast_recap'}` and `category ∈ {'physicians','dentists','physiotherapy'}` before constructing the prompt.

---

## Test Coverage Gaps

### Entire mobile app — zero tests

- What's not tested: Every `.tsx` in `app/`, `components/`, `hooks/`, `services/`, `lib/`. The only "test" in the repo (`scripts/test_gemini.js`) is a manual diagnostic script that hits the live API and prints status.
- Files: (all source)
- Risk: Every issue in "Known Bugs" above is invisible to the team until a user reports it. The wire-format parser especially has zero coverage.
- Priority: High

### Backend — zero tests

- What's not tested: `backend/server.js` end-to-end (`/health`, `/api/chat` happy path, retry path, scrubber branch, empty message branch). The fragile `APPROVED_HEADINGS` filter (`:252-266`) has no fixtures.
- Files: `backend/server.js`, `backend/package.json` (no `test` script)
- Risk: Any edit to the prompt or scrubber silently breaks chat — the unstaged Groq→Gemini revert in `git diff` is exactly the kind of change that goes undetected.
- Priority: High

### Parser contract — the most fragile untested code

- What's not tested: `parseMedicalSections` (`ChatTab.tsx:205-229`) and the mirror scrubber in `backend/server.js:251-266`. They share a regex with two divergent filtering rules; behavior drift is silent.
- Files: `app/(tabs)/ChatTab.tsx:205-229`, `backend/server.js:251-266`
- Risk: Misrendered AI replies (the app's only feature) go undetected.
- Priority: Critical

### Supabase client SSR null path

- What's not tested: `lib/supabase.ts:19-41` decides whether to create a client based on `typeof window !== 'undefined' || Platform.OS !== 'web'`. The Proxy at `:47-54` returns `undefined` per-prop when no client exists. No test exercises the web/no-client case.
- Files: `lib/supabase.ts`
- Risk: Web build of the app could crash silently if any screen calls `supabase.from(...)` on a SSR render.
- Priority: Medium

### Hook `useUserProfile` returns mock state

- What's not tested: `hooks/useUserProfile.ts:12-17` is a no-op. Once real auth lands, this becomes the place profile loading lives, and it has zero behavioral tests today.
- Files: `hooks/useUserProfile.ts`
- Risk: Refactoring the hook to actually fetch will introduce async lifecycles with no regression net.
- Priority: Medium

---

*Concerns audit: 2026-08-04*