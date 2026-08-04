# Testing Patterns

**Analysis Date:** 2026-08-04

## Test Framework

**Runner:**
- **None configured.** No test runner (`jest`, `vitest`, `mocha`, `@testing-library/react-native`, `playwright`) is declared in `package.json` (`dependencies` or `devDependencies`). No Jest / Vitest / Playwright config files exist anywhere in the repo.
- `devDependencies` only contains: `eslint` ^9.25, `eslint-config-expo` ~57.0.1, `@types/react` ~19.2.10, `typescript` ~6.0.3 (`package.json:53-58`)
- Backend `backend/package.json` also declares no test runner or `test` script — only `start` and `dev` (nodemon) (`backend/package.json:6-9`)

**Assertion Library:** None installed.

**Run Commands:**
```bash
# Not applicable — no test script defined
npm run lint        # ESLint via expo lint (the only quality gate)
node scripts/test_gemini.js   # Manual diagnostic, not a unit test
node scripts/check_data.js    # Manual Supabase data check
```

## Test File Organization

**Location:**
- **No test files exist.** A glob for `**/*.{test,spec}.{ts,tsx,js,jsx}` and `**/__tests__/**` both returned zero matches across the full repo.
- The only file matching the word "test" is `scripts/test_gemini.js` — a manual, interactive Gemini API connectivity diagnostic, not a Jest/Vitest unit test.

**Naming:** No convention established yet. When introducing tests, follow the project's existing pattern of co-locating node-equivalent scripts under `scripts/` and use a `.test.ts` / `.spec.ts` suffix co-located with the source under test (recommended layout below).

**Structure (recommended — not yet present):**
```
app/(tabs)/ChatTab.tsx
app/(tabs)/__tests__/ChatTab.test.tsx        # component tests (RTL/RN Testing Library)
services/aiService.ts
services/__tests__/aiService.test.ts          # unit tests (mock fetch)
hooks/useUserProfile.ts
hooks/__tests__/useUserProfile.test.ts        # hook tests (renderHook)
backend/server.js
backend/__tests__/server.test.js              # supertest + nock for Express routes
```

## Test Structure

**Suite Organization:** Not yet applicable — no tests are written. When adding tests, use the following proposed skeleton (aligned with the existing code style — double quotes, 2-space indent, named exports, React FC types):

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react-native";
import { useUserProfile } from "../useUserProfile";

describe("useUserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null profile and not loading by default", () => {
    const { result } = renderHook(() => useUserProfile());
    expect(result.current.profile).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
```

## Mocking

**Framework:** None configured. When introducing tests, recommended mocks:

**Patterns (proposed):**
```typescript
// Mock the global fetch for aiService — pattern matches the real fetch call in services/aiService.ts:26
const okResponse = (body: unknown) =>
  ({
    ok: true,
    json: async () => body,
  }) as Response;

beforeEach(() => {
  global.fetch = vi.fn();
});

it("returns the reply and citations from the backend", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce(
    okResponse({ reply: "Clinical AI response", citations: [] }),
  );
  const { reply, citations } = await aiService.sendMessageByText("query");
  expect(reply).toBe("Clinical AI response");
  expect(citations).toEqual([]);
});

it("falls back to a friendly message on non-OK response", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 } as Response);
  const { reply } = await aiService.sendMessageByText("query");
  expect(reply).toContain("I'm sorry");
});
```

**What to Mock:**
- `global.fetch` in `services/aiService.ts` tests — the service performs one `fetch` to `${BACKEND_URL}/api/chat`; assert headers/method/body and stub both the OK and the non-OK branches (`services/aiService.ts:26-41`)
- `console.error` in tests that exercise error paths — the service logs `console.error('AI Service Error:', error)` (`services/aiService.ts:43`)
- `process.env.EXPO_PUBLIC_BACKEND_URL` to verify the `|| 'http://localhost:3001'` fallback (`services/aiService.ts:1-2`)
- `getSupabaseClient` / the `supabase` Proxy in `hooks/useUserProfile.ts` tests — the hook imports `../lib/supabase`; mock the module
- `expo-router` `router.push` / `router.back` in component tests for `CategoryPage`, `ChatTab`, `index`, `profile`

**What NOT to Mock:**
- Do not mock `react-native` primitives or `react-native-reanimated` shared values; use the official testing-library setup
- Do not mock the backend Express routes when testing `backend/server.js` — use `supertest` against the actual app, and mock only the external `fetch` calls to HuggingFace / EuropePMC / Gemini

## Fixtures and Factories

**Test Data:** None exist. When introducing fixtures, follow the domain shapes:

```typescript
// Cite the cited Citation type from services/aiService.ts:6-13
import type { Citation, DoctorCategory } from "../../services/aiService";

const baseCitation = (): Citation => ({
  id: "1",
  title: "Title",
  author: "Author",
  journal: "Journal",
  year: "2026",
  url: "https://example.org/pmid",
});

const baseMessage = (overrides: Partial<Message> = {}): Message => ({
  id: Date.now().toString(),
  text: "Sample clinical query",
  isUser: true,
  timestamp: "10:00",
  ...overrides,
});
```

**Location (recommended):** `services/__tests__/fixtures.ts`, `app/__tests__/fixtures.ts` — co-locate with the test suite; no shared top-level `fixtures/` dir exists today.

## Coverage

**Requirements:** None enforced. No `coverage` threshold, no `vitest --coverage`, no Codecov/Codecov config, no IDE coverage settings in `.vscode/`.

**View Coverage (after adding a runner):**
```bash
npx vitest run --coverage
# or, for Jest:
npx jest --coverage
```

## Test Types

**Unit Tests:** Not present. Highest-value units to test first:
- `services/aiService.ts` — `sendMessageByText` happy path, non-OK path, thrown-error path (the three branches at lines 26-46)
- `app/(tabs)/ChatTab.tsx::parseMedicalSections` — the regex parser at `app/(tabs)/ChatTab.tsx:205-229` is a pure function and the most testable surface today; test with `##DEFINITION##...##END##` strings and edge cases (no sections, malformed delimiters, EMPTY heading, "END" as heading)
- `backend/server.js` section scrubber (`backend/server.js:248-268`) and `APPROVED_HEADINGS` allow-list — these are pure functions implicitly; test the cleanser through a supertest POST `/api/chat`

**Integration Tests:** Not present. Recommended priorities:
- `backend/server.js` `/api/chat` end-to-end with Thunder Client-style supertest — mock `fetch` to HuggingFace/EuropePMC/Gemini and assert the assembled prompt + the scrubbed output shape and `citations` array
- `App+route navigation`: Expo Router integration — not yet testable as no test env is configured

**E2E Tests:** Not used. No Detox, Maestro, Playwright, or Appium config exists.

## Common Patterns

**Async Testing (proposed):**
```typescript
it("awaits the fetch before settling", async () => {
  let resolveFetch: (v: Response) => void = () => {};
  (global.fetch as jest.Mock).mockReturnValueOnce(new Promise<Response>((r) => { resolveFetch = r; }));
  const pending = aiService.sendMessageByText("q");
  resolveFetch(okResponse({ reply: "ok" }) as Response);
  await expect(pending).resolves.toEqual({ reply: "ok", citations: undefined });
});
```

**Error Testing (proposed):**
```typescript
it("returns a fallback reply when fetch throws", async () => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("network down"));
  const { reply } = await aiService.sendMessageByText("q");
  expect(reply).toContain("I can't reach the medical AI server");
});
```

## Manual / Diagnostic Scripts

The closest thing to tests in the repo are standalone Node scripts under `scripts/`:

| Script | Purpose | Invocation |
|--------|---------|------------|
| `scripts/test_gemini.js` | Manual Gemini API key / connectivity diagnostic; reads `.env` directly and sends one prompt | `node scripts/test_gemini.js` |
| `scripts/check_data.js` | Connects to Supabase and prints unique `Category` values from the `drug_database` table | `node scripts/check_data.js` |
| `scripts/seed_drugs.js` | Seeds the `drugs` table | `node scripts/seed_drugs.js` |
| `scripts/update_search_query.js` | Single-row updater for the `Search Query` column | `node scripts/update_search_query.js` |
| `scripts/update_search_query_batch.js` | Batch version of the above | `node scripts/update_search_query_batch.js` |

These are not composable test suites — they are one-shot maintenance scripts. Do not count them toward coverage.

## CI / Quality Gates

**CI Pipeline:** None. There is no `.github/`, `.gitlab-ci.yml`, `bitrise.yml`, `app.json` EAS build hook, or any other CI config file. The only local quality gate is:

```bash
npm run lint        # `expo lint` — runs ESLint with eslint-config-expo/flat
```

**Recommended minimum CI to add:** run `npm run lint` plus `tsc --noEmit` and a unit suite on every PR.

## Testing Gaps (priority list)

When tests are introduced, address in this order:

1. **`parseMedicalSections`** (`app/(tabs)/ChatTab.tsx:205-229`) — pure function, easy first win
2. **`aiService.sendMessageByText`** happy/error/fallback branches (`services/aiService.ts:20-46`)
3. **`backend/server.js`** section scrubber + `/api/chat` integration via `supertest`
4. **`useUserProfile`** hook behavior (`hooks/useUserProfile.ts`)
5. **`CategoryPage`** render + `router.push` interaction (`components/CategoryPage.tsx`)
6. **`app/(tabs)/ChatTab`** `handleTextSend`, `handleSelectCategory`, `handleCopyText` flows (`app/(tabs)/ChatTab.tsx:455-508`)

---

*Testing analysis: 2026-08-04*