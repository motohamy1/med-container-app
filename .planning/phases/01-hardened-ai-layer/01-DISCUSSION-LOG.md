# Phase 1: Hardened AI Layer - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-25
**Phase:** 1-Hardened AI Layer
**Areas discussed:** JSON repair strategy, Synthesis payload shape, Provider routing for JSON calls, Retry/backoff & cooldown, Keyword extraction, Proof & regression

---

## Interaction Note

Gray-area selection and depth prompts were presented twice (clarify form + retry); both timed out with empty responses. Per the workflow's answer-validation fallback, the discussion proceeded in Rapid mode: Claude selected options within the user's standing constraints (free-tier budgets bounded, keep router architecture, keep review gates) and recorded every choice here for veto. This matches the "Rapid — I decide details within your constraints" option that was offered.

## JSON Repair Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Extract-only | Pull JSON substring out of polluted output; no second call | |
| Extract + 1 LLM repair pass | Extraction, then a single budgeted repair call on failure | ✓ |
| Straight to dead-letter | No recovery attempt; fail fast to durable store | |

**User's choice:** (Claude discretion, rapid mode)
**Notes:** D-01/D-02 — ladder = strip think/fences → extract balanced substring → one repair call → dead-letter. Repair calls share the per-topic retry budget (≤2 extra).

## Synthesis Payload Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Single call, raised cap | maxOutputTokens 8192 + JSON mode for synthesis calls | ✓ |
| Section-chunked always | Split 5 sections across 2 smaller calls every time | |
| Shrink schema | Fewer/shorter sections to fit 4096 | |

**User's choice:** (Claude discretion, rapid mode)
**Notes:** D-03/D-04/D-05 — chunking kept as MAX_TOKENS escalation path only; model pin verified at implementation time.

## Provider Routing for JSON Calls

| Option | Description | Selected |
|--------|-------------|----------|
| Gemini-first structured | Native JSON mode; Groq reasoning models excluded from JSON calls | ✓ |
| Keep current order | Groq reasoning models first, rely on post-hoc cleaning | |
| Drop Groq entirely | Remove Groq from all paths | |

**User's choice:** (Claude discretion, rapid mode)
**Notes:** D-06/D-07 — think-stripping stays in both layers as defense in depth; llama-3.3-70b may fall through.

## Retry, Backoff & Cooldown

| Option | Description | Selected |
|--------|-------------|----------|
| Classified retries | Transient → exp backoff+jitter ×3; quota → provider cooldown ~60s | ✓ |
| Retry everything equally | Uniform backoff regardless of error class | |
| Fail over immediately | No same-provider retry; straight rotation | |

**User's choice:** (Claude discretion, rapid mode)
**Notes:** D-08/D-09/D-10 — honor Retry-After hints capped at backoff ceiling; executeAI signature stays source-compatible via optional trailing options param.

## Keyword Extraction

| Option | Description | Selected |
|--------|-------------|----------|
| Harden + count degradation | Same layer/ladder; cleanup fallback logged when used | ✓ |
| Leave as-is | Out of phase scope anyway | |
| Remove AI keywords | Static extraction only | |

**User's choice:** (Claude discretion, rapid mode)
**Notes:** D-11 — return shape unchanged (space-joined string).

## Proof & Regression

| Option | Description | Selected |
|--------|-------------|----------|
| Permanent replay fixtures | backend/scripts/replay-failures.js, node:assert, npm script, Aug 25 classes verbatim | ✓ |
| Throwaway replay script | One-off verification during build | |
| Full test framework | Introduce jest/vitest now | |

**User's choice:** (Claude discretion, rapid mode)
**Notes:** D-12 — repo deliberately has no test runner; ≥95% parse-success bar on fixture set.

## Claude's Discretion

Backoff constants, cooldown tuning, module organization, extractor internals, fixture wording.

## Deferred Ideas

None.
