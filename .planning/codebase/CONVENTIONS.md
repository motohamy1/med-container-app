# Coding Conventions

**Analysis Date:** 2026-08-04

## Languages

**Primary:**
- TypeScript (`strict: true`) — all React Native / Expo app code under `app/`, `components/`, `services/`, `hooks/`, `lib/`, `types/`
- JavaScript (CommonJS) — Express backend at `backend/server.js` and admin scripts under `scripts/` (Node, no TS)

**Secondary:**
- CSS — single stylesheet `app/global.css` consumed by NativeWind via Metro (`metro.config.js`)
- SQL — `schema.sql`, `setup-drugs-table.sql` (schema bootstrap for Supabase `drugs` / `drug_database` tables)

## Naming Patterns

**Files:**
- React components / screens: `PascalCase.tsx` for shared components (`components/CategoryPage.tsx`); route files use Expo Router's reserved names — `index.tsx`, `_layout.tsx`, `+not-found.tsx` (`app/(tabs)/ChatTab.tsx`, `app/heart/index.tsx`)
- Non-component TS modules: `camelCase.ts` (`services/aiService.ts`, `hooks/useUserProfile.ts`, `lib/supabase.ts`)
- Auto-generated types: `*-env.d.ts` (`expo-env.d.ts`, `nativewind-env.d.ts`) plus hand-written `types/supabase.ts` (Supabase-generated `Database` shape — keep PascalCase `Database` export name)
- Backend & scripts: `camelCase.js` (`backend/server.js`, `scripts/seed_drugs.js`, `scripts/update_search_query.js`)
- Config: `kebab-case.config.js` for toolchain (`babel.config.js`, `metro.config.js`, `postcss.config.js`), root-level `tailwind.config.js`, `eslint.config.js`, `tsconfig.json`

**Components / Functions:**
- React screen components: `export default function Name()` for route screens (`app/(tabs)/ChatTab.tsx:433`, `app/(tabs)/profile.tsx:282`, `components/CategoryPage.tsx:58`)
- Named-export functional components for reusable pieces: `export const CategoryPage: React.FC<CategoryPageProps> = ...` (`components/CategoryPage.tsx:58`)
- Internal building-block components defined inside the same file (not exported): `const Header = () => (...)`, `const SearchBar = () => (...)`, `const OrbitButton = (...) => (...)`, `const ChatBubble: React.FC<...> = ...` — see `app/(tabs)/index.tsx:48-237`, `app/(tabs)/ChatTab.tsx:231-431`, `app/(tabs)/profile.tsx:111-279`
- Async service methods on a singleton object: `export const aiService = { async sendMessageByText(...), async processAudio(...) }` (`services/aiService.ts:15`)
- Hooks: `export const useUserProfile = () => { ... }` (`hooks/useUserProfile.ts:7`); prefix all custom hooks with `use`
- Backend async helpers: `async function fetchMedicalKnowledge(query)`, `function callAI(prompt, retries = 3)` (`backend/server.js:28,92`)

**Variables:**
- Local state: `const [x, setX] = useState<T>(initial)` — `setX` setter naming enforced (`app/(tabs)/ChatTab.tsx:435-438`)
- Constants: `UPPER_SNAKE_CASE` for compile-time-ish values (`SCREEN_WIDTH`, `ORBIT_SIZE`, `FLOATING_TAB_BAR_HEIGHT`, `CHAT_BOTTOM_OFFSET`, `CATEGORIES`, `QUICK_PROMPTS`, `SECTION_CONFIG`, `FALLBACK_PALETTE`, `GRADIENT_COLORS`, `INACTIVE_COLOR`) — defined at module top before use (`app/(tabs)/index.tsx:16-30`, `app/(tabs)/ChatTab.tsx:36-201`, `app/(tabs)/_layout.tsx:7-8`)
- Module-private singletons: `let supabaseInstance` cached via lazy init (`lib/supabase.ts:11`)

**Types:**
- Interfaces: PascalCase, only for object shapes that need declaration merging (Supabase `Database` in `types/supabase.ts:9`)
- Type aliases: `type Message = { ... }`, `type CategoryOption`, `type QuickPrompt`, `type Citation`, `type DoctorCategory`, `type MedicalSection`, `type TopicItem` — defined locally above the component that uses them (`app/(tabs)/ChatTab.tsx:42-72,203`, `components/CategoryPage.tsx:13-23`, `services/aiService.ts:4-13`)
- Props types: co-located, named `XProps` (`type CategoryPageProps` at `components/CategoryPage.tsx:13`) or inline object literal in the FC generic
- Use `keyof typeof Ionicons.glyphMap` for icon-name props (see `categoryIcon` in `components/CategoryPage.tsx:15`, `icon` in `app/(tabs)/profile.tsx:22`)
- Avoid `any` except where Expo Router's `router.push` is forced through (`router.push(route as any)` at `app/(tabs)/index.tsx:126`) — use a typed `as any` cast rather than weakening the API

## Code Style

**Formatting:**
- Linting-driven formatting only — ESLint is the only enforced style tool; **no Prettier config is present** (root `eslint.config.js`)
- Indentation: 2 spaces in app/TS files; 4 spaces in `backend/server.js` and `scripts/*.js` (CommonJS Node convention)
- Strings: double quotes `"..."` in most TS files (`app/(tabs)/ChatTab.tsx`, `app/(tabs)/_layout.tsx`); single quotes `'...'` mixed in (`components/CategoryPage.tsx`, `app/(tabs)/profile.tsx`, `app/(tabs)/index.tsx`) — **not consistent across files**, prefer double quotes for new files to match the largest screen modules
- Trailing commas: used in multi-line objects/arrays; semicolons: omitted in most TS files (ESLint-preprocess), present in `scripts/*.js`
- Import order (de facto): 1) external packages, 2) React/react-native primitives, 3) project modules with relative paths. Group with blank line between sections (see `app/(tabs)/ChatTab.tsx:1-34`, `app/(tabs)/index.tsx:1-14`)

**Linting:**
- Tool: ESLint 9 flat config (`eslint.config.js`)
- Config: `eslint-config-expo/flat` (the Expo preset for RN + Expo Router) plus an `ignores: ['dist/*']` block
- Run: `npm run lint` → `expo lint`
- TypeScript: `tsconfig.json` extends `expo/tsconfig.base` with `strict: true`, `esModuleInterop: true`, `allowSyntheticDefaultImports: true`

**Styling:**
- NativeWind v4 (Tailwind v3 preset) via `babel-preset-expo` with `jsxImportSource: "nativewind"` (`babel.config.js`)
- Tailwind tokens defined in `tailwind.config.js` — OKLCH color ramp for `background`/`teal-*`/`turquoise`/`gold`/`charcoal`, plus named shadows `shadow-glow-cyan`, `shadow-glow-gold`, `shadow-bubble`, `shadow-card`
- Prefer `className="..."` utility classes over inline `style={{}}`. Inline style is reserved for computed/dynamic values (sizes from `Dimensions`, opacity from Reanimated shared values, color suffix concatenation like `cfg.border + "65"`) — see `app/(tabs)/index.tsx:133-134`, `app/(tabs)/ChatTab.tsx:253-296`
- Color hex literals are sprinkled into JSX (e.g. `"#6ec2be"`, `"#a3a8af"`, `"#101214"`); for new code prefer the named Tailwind tokens (`text-turquoise`, `bg-teal-dark`) over hardcoded hex

## Import Organization

**Order (typical, by convention not enforced):**
1. External npm packages — `@expo/vector-icons`, `expo-router`, `react`, `react-native`, `react-native-reanimated`, `react-native-safe-area-context`, `@supabase/supabase-js`
2. Lines from `react-native` primitives grouped inside a single destructure block
3. Project-internal relative imports using the `@/*` alias or relative paths — `../../services/aiService`, `../../hooks/useUserProfile`, `../../lib/supabase`, `../../types/supabase`
4. Side-effect / global CSS imports last (`import "./global.css"` in `app/_layout.tsx:3`)

**Path Aliases:**
- `@/*` → `./*` (configured in `tsconfig.json:7-9`) — **available but rarely used**; in practice files use relative paths. Prefer `@/` alias for new top-level imports to reduce `../../` depth

## Error Handling

**Patterns:**
- **Service layer — graceful degradation to a user-facing fallback string.** Network/parse failures in `aiService.sendMessageByText` are caught, logged via `console.error('AI Service Error:', error)`, and a friendly reply is returned rather than rethrown: `"I'm sorry, I can't reach the medical AI server right now..."` (`services/aiService.ts:42-45`). Always return the documented return shape `{ reply, citations? }`.
- **HTTP non-OK responses** return a fallback reply instead of throwing (`services/aiService.ts:32-35`)
- **Backend API route** wraps the full handler body in `try/catch`, logs `[route] err.message`, and returns `res.status(500).json({ error, reply })` so the client always gets a reply field (`backend/server.js:273-279`)
- **Backend AI calls** use an explicit retry loop with exponential backoff inside `callAI(prompt, retries = 3)` — throws only after the final attempt (`backend/server.js:92-110`); returns `''` on missing key
- **External fetch helpers** (`fetchMedicalKnowledge`, `fetchEuropePMC`) swallow errors and return empty `''` / `[]` so a single upstream failure never breaks the chat (`backend/server.js:28-90`)
- **Component error logging** — UI handlers wrap await in `try/catch` and `console.error(error)` without user-visible alerts (`app/(tabs)/ChatTab.tsx:500-507`)
- **Domain-guard failures** use `Alert.alert(title, body)` for feature gates (`Alert.alert("Coming Soon", ...)` at `app/(tabs)/ChatTab.tsx:457`) and confirmations (`Alert.alert("Copied", ...)` at `:465`)
- **Startup validation**: backend logs `CRITICAL: GEMINI_API_KEY is missing in backend/.env` on boot but does **not** exit — the server keeps running and surfaces the error per-request (`backend/server.js:13-15`)

**Anti-pattern to avoid:** do not let a service throw into the React render tree. The `aiService` contract is "always resolve with a reply" — preserve that for new methods.

## Logging

**Framework:** Raw `console.log` / `console.error` — no logger library is configured.

**Patterns:**
- Tagged prefixes for server logs: `console.error('[/api/chat]', err.message)` (`backend/server.js:274`), `console.log(\`[AI Response Category: ${category}]...\`)` (`backend/server.js:270`), `console.log(\`✅ Med Arena Clinical Backend running...\`)` (`backend/server.js:284`)
- Client errors: `console.error('Chat API error:', response.status)` and `console.error('AI Service Error:', error)` (`services/aiService.ts:33,43`), `console.error(error)` inside UI handlers (`app/(tabs)/ChatTab.tsx:504`)
- Diagnostic scripts in `scripts/` print structured headers: `console.log("--- Gemini API Diagnostics ---")` (`scripts/test_gemini.js`)

## Comments

**When to Comment:**
- Use `//` line comments for section banners and intent inside large files: `// Header Component`, `// Search Bar Component`, `// Orbit Button Component`, `// Recent Inquiries Component` (`app/(tabs)/index.tsx:47,75,111,203`); `// ─── Helpers ───`, `// ─── Routes ───`, `// ─── Start ───` (boxed comment dividers in `backend/server.js:26,112,282`)
- Inline `//` for non-obvious workarounds — `// Lazy initialization to avoid SSR issues with Expo Router web` (`lib/supabase.ts:10`), `// Only initialize on client side` (`lib/supabase.ts:19`), `// Top 3 most relevant papers` (`backend/server.js:70`), `// Tells Supabase Auth to continuously refresh the session...` (`lib/supabase.ts:29-33`)
- TODO-style notes are scarce; one example inside `hooks/useUserProfile.ts:14`: `// Optionally set a mock user ID here if needed for testing auth-gated features`

**JSDoc/TSDoc:**
- Minimal. Only `aiService` carries a brief `/** ... */` block describing method purpose (`services/aiService.ts:16-19`). No project-wide JSDoc convention — do not consider JSDoc required, but add it when a service contract changes (params, return shape, side-effects).

## Function Design

**Size:** Screen components are large (e.g. `ChatTab.tsx` is ~720 lines, `profile.tsx` ~390). New screens should split into small named subcomponents within the same file (the codebase pattern) and extract reusable ones into `components/`.

**Parameters:**
- Typed object props for components, never positional booleans
- Multiple optional params default to sensible values: `aiService.sendMessageByText(message, mode = 'general', category = 'physicians')` (`services/aiService.ts:20-22`)
- Use discriminated unions for closed sets: `DoctorCategory = 'physicians' | 'dentists' | 'physiotherapy'` (`services/aiService.ts:4`)

**Return Values:**
- Services return structured objects: `Promise<{ reply: string; citations?: Citation[] }>` (`services/aiService.ts`)
- Hooks return a tuple-shaped object: `{ profile, loading, userId }` (`hooks/useUserProfile.ts:19`)
- Backend fetch helpers return empty values on failure rather than `null`/`undefined` — preserves type narrowing at the call site

## Module Design

**Exports:**
- Default export for screens/route components (Expo Router requirement): `export default function Index()` (`app/(tabs)/index.tsx:244`)
- Named exports for reusable components & singletons: `export const CategoryPage` (`components/CategoryPage.tsx:58`), `export const aiService` (`services/aiService.ts:15`), `export const useUserProfile`, `export const getSupabaseClient`, `export const supabase` (lazy Proxy)
- Types co-exported from the module that owns them: `Citation`, `DoctorCategory` exported from `services/aiService.ts` and re-imported at `app/(tabs)/ChatTab.tsx:34`
- Backend uses `require()` CommonJS — no ESM import/export in `backend/server.js` or `scripts/`

**Barrel Files:** None. There is no `index.ts` barrel in `components/`, `services/`, `hooks/`, `types/`, or `lib/`. Import directly from the file: `import { aiService } from '@/services/aiService'`.

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

---

*Convention analysis: 2026-08-04*