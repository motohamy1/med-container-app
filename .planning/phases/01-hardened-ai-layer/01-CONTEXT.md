# Phase 1: Hardened AI Layer - Context

**Gathered:** 2026-08-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Make every LLM call in the knowledge-ingestion path produce parseable JSON and survive transient failures (requirements AIH-01..05): schema-constrained generation, parse-and-repair ladder, sized token budgets, bounded backoff retries with provider cooldown, and hardened keyword extraction. The chat path (/api/chat) must not regress. Durable job state, quota enforcement, and validation gates belong to Phases 2–4.

</domain>

<decisions>
## Implementation Decisions

> Mode note: discussion prompts timed out unanswered twice; user's standing constraints were applied and every decision below is explicitly recorded for later veto.

### JSON Repair Strategy (AIH-02)
- **D-01:** Full parse-and-repair ladder replaces all bare `JSON.parse` calls on LLM output. Ladder stages, in order: (1) strip `<think>`/`<thought>` blocks and markdown fences; (2) extract the JSON substring (first `{` or `[` to its last balanced closing bracket); (3) attempt targeted single LLM repair pass ("return ONLY the corrected JSON") including the parse error, budgeted to exactly 1 retry; (4) dead-letter — persist raw output snippet + error to a durable failures store, never console-only loss.
- **D-02:** Stage 2 extraction must be pure-string manipulation (no regex-only parsing of nested structures); stage 3 repair calls count against the same bounded retry budget as transport retries (total extra calls per topic ≤ 2).

### Synthesis Payload Shape (AIH-03)
- **D-03:** Per-call generationConfig instead of the global model singleton: synthesis calls get `maxOutputTokens: 8192` + `responseMimeType: "application/json"` + explicit responseSchema; small calls (keywords, intent) keep smaller budgets.
- **D-04:** Check `finishReason`; on `MAX_TOKENS` truncation do NOT blind-retry the same call — escalate once to section-chunked synthesis (2 calls: sections 1–3, 4–5) before dead-lettering. Chunking stays an escalation path, not the default, to protect free-tier quota.
- **D-05:** Model pin review: verify `gemini-1.5-flash` still honors 8192 output tokens and JSON mode at implementation time; if deprecated/limited, migrate pin within the same SDK (no architecture change).

### Provider Routing for JSON Calls (AIH-04 adjacent)
- **D-06:** Structured-output calls route Gemini-first (native JSON mode eliminates `<think>` leakage at source). Groq reasoning models (`qwen/qwen3.6-27b`, `gpt-oss-*`) are excluded from JSON-schema calls by default; Groq non-reasoning models (`llama-3.3-70b-versatile`) may fall through but their output passes the same repair ladder.
- **D-07:** Keep `<think>` stripping in BOTH `cleanText()` and the new extractor — defense in depth, since router order can change.

### Retry, Backoff & Cooldown (AIH-04)
- **D-08:** Error classification: transient (network fetch failure, 5xx, 503, 429 with short Retry-After) → exponential backoff retry (start ~1s, ×2, full jitter, max 3 attempts); quota-exhausted (persistent 429 / RESOURCE_EXHAUSTED) → mark provider cooling-down (~60s window), route to next provider immediately, no hammering.
- **D-09:** Honor server-provided `retryDelay`/`Retry-After` hints when present, capped at the backoff ceiling.
- **D-10:** Chat-path `executeAI` gains these behaviors WITHOUT changing its public signature used by callers (optional trailing options param); existing call sites stay source-compatible.

### Keyword Extraction (AIH-05)
- **D-11:** Keyword extraction goes through the same hardened layer (schema mode + ladder). The basic-cleanup string fallback remains as final resort but its use must be counted/logged so degradation is visible, not silent.

### Proof & Regression (verification)
- **D-12:** Permanent replay fixtures: `backend/scripts/replay-failures.js` using plain `node:assert` (no new test framework — repo has none by choice). Fixture set reproduces the Aug 25 failure classes verbatim: `<think>` preamble, truncated string at ~10k chars, prose wrapper ("Based on t…"), empty payload, bad control character. Success bar ≥95% parsed; runnable via `npm run replay:failures`.

### Claude's Discretion
Exact backoff constants beyond D-08 defaults, cooldown window tuning, internal file/module organization under `backend/services/`, extractor implementation details, fixture wording variations.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Current implementation (modify, don't rewrite)
- `backend/services/aiService.js` — router (Groq→Gemini→NVIDIA→OpenRouter), `cleanText()`, global `aiModel` singleton being replaced by per-call config, `callAI` signature that must stay compatible
- `backend/services/autonomousScientistService.js` — primary consumer: brainstorm/synthesis/keyword calls, bare `JSON.parse` sites to replace
- `backend/services/medicalSearchService.js` — literature fetch feeding synthesis prompts
- `backend/routes/chatRoutes.js` — chat consumer whose behavior must not regress

### Planning artifacts
- `.planning/research/SUMMARY.md` — verified library facts (JSON mode availability, `<think>` origin, backoff guidance) and failure taxonomy
- `.planning/codebase/STACK.md` — pinned versions (@google/generative-ai ^0.24.1, express, supabase-js)
- `.planning/codebase/ARCHITECTURE.md` — system boundaries

### External
- https://ai.google.dev/gemini-api/docs/structured-output — responseMimeType/responseSchema usage for the installed SDK generation
- https://ai.google.dev/gemini-api/docs/rate-limits — free-tier quota behavior informing D-08/D-09

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `cleanText()` in aiService.js — already strips think-blocks post-hoc; extend/reuse inside ladder stage 1
- Router fallback order in `executeAI()` — cooldown logic slots into the existing provider loop
- `scientific_ledger` insert pattern (logToLedger) — reuse for counting degraded keyword extractions and dead-letter events until Phase 2 introduces dedicated state tables
- `notificationService.test.js` — precedent for plain node tests without a framework

### Established Patterns
- CommonJS require throughout backend — new modules follow suit (no ESM)
- Console-prefixed logging namespaces (`[Scientist Agent]`, `[AI Router]`) — keep convention
- No test runner configured — verification via scripts, per D-12

### Integration Points
- `callAI(systemPrompt, userPrompt, history)` consumed by scientist service and chat routes — extend with optional options object (backward compatible)
- `extractEnglishKeywords` return shape (space-joined string) must not change — downstream literature search depends on it

</code_context>

<specifics>
## Specific Ideas

User's driving evidence is the Aug 25 pulmonology expansion log (pasted in session). Its exact error strings are canonical test fixtures (see D-12). Target state named by user: "full robust reliable system to really ingest and fill all specialities, each category 50+."

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. Phase 2+ concerns (job persistence, resume, quota top-up, validation gates) are already roadmap phases, not lost ideas.

</deferred>

---

*Phase: 1-Hardened AI Layer*
*Context gathered: 2026-08-25*
