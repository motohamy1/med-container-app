# Project Research Summary — Ingestion Reliability

**Date:** 2026-08-25
**Scope:** Targeted verification of library facts needed for REQUIREMENTS/ROADMAP. Domain = LLM ingestion pipeline hardening (Node.js, @google/generative-ai v0.24.x, Groq OpenAI-compatible API, Supabase).

## Key Findings

### Stack facts (verified)

1. **Gemini native JSON mode exists in the installed SDK.** `generationConfig.responseMimeType: "application/json"` plus optional `responseSchema` constrains output to valid JSON and removes markdown fences/prose at the source. Available in `@google/generative-ai` 0.24.x via `getGenerativeModel({ model, generationConfig })`. Confidence: HIGH (ai.google.dev structured-output docs; Firebase/Vertex mirrors).
   - Implication: a per-call model factory (different generationConfig per call type) beats the current single global `aiModel` singleton.
2. **`<think>` blocks come from Groq reasoning models**, not Gemini. The current router includes `qwen/qwen3.6-27b` and `openai/gpt-oss-*`; these emit `<think>...</think>` before the answer. `cleanText()` strips them only after the full response returns — but the scientist service parses raw `callAI` output with regex-fence-stripping + `JSON.parse`, so any leaked think-block or stray prose becomes `Unexpected token '<'`. Confidence: HIGH (log evidence matches exactly).
3. **429/RESOURCE_EXHAUSTED handling:** Google's documented recommendation is truncated exponential backoff with jitter; free-tier quotas are per-model and can be 0 for some models. Confidence: HIGH (ai.google.dev rate-limits docs; GCP error-code-429 doc).
   - Implication: retry budget must be bounded (cost constraint) and provider rotation must distinguish transient (retry same/other provider) vs quota-exhausted (cool down provider).

### Failure taxonomy from the Aug 25 pulmonology log

| Symptom in log | Root cause | Class |
|---|---|---|
| `Unexpected token '<', "<think>..."` | Groq reasoning-model preamble reaching JSON.parse | Malformed output |
| `Unterminated string at position ~10008` | `maxOutputTokens: 4096` too small for 5-section synthesis | Truncation |
| `Unexpected end of JSON input` | Same truncation, shorter payloads | Truncation |
| `[AI Router] Gemini failed ... Error fetching` | Transient network/quota; no retry, falls through or dies | Transient transport |
| `Keyword Extractor ... falling back to basic cleanup` | Same parse fragility on keyword call (lower stakes) | Malformed output |
| nodemon restart wipes run | No persisted run/checkpoint state | Statelessness |
| Category ends under 50 topics | No quota check/top-up loop after first pass | No enforcement |

### Architecture patterns (standard practice for this class of pipeline)

- **Parse-and-repair ladder**: schema-constrained generation → extract JSON substring (first `{`/`[` to last matching bracket) → targeted repair pass ("return ONLY corrected JSON") → fail to durable dead-letter. Never bare `JSON.parse`.
- **Job queue as DB rows**: expansion runs and per-topic work items stored in Supabase tables (status PENDING/RUNNING/DONE/FAILED, attempt_count, last_error) — survives restarts, enables resume and observability. Fits existing `scientific_ledger` pattern.
- **Idempotent upserts**: dedupe by (specialty_id, normalized title) unique constraint instead of select-then-insert race.
- **Section-chunked synthesis**: generate clinical_content sections in 1–2 calls instead of one giant JSON blob when payloads risk the token ceiling; or raise maxOutputTokens for synthesis calls only.
- **Quota reconciliation loop**: after brainstorm pass, count topics per (specialty, category), re-brainstorm missing count, repeat until target met or max rounds.

## Implications for Roadmap

Build order follows dependency: (1) hardened AI layer (JSON mode + repair + backoff + per-call config) → (2) durable job state + resume → (3) quota enforcement loop → (4) validation gates + review path → (5) end-to-end fill run across all specialties.

## Sources

- ai.google.dev/gemini-api/docs/structured-output (responseMimeType/responseSchema)
- docs.cloud.google.com Gemini error-code-429 (truncated exponential backoff)
- ai.google.dev/gemini-api/docs/rate-limits (free-tier behavior)
- Local evidence: backend/services/autonomousScientistService.js, backend/services/aiService.js, user-provided Aug 25 run log
