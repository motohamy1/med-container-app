# Medical Arena — Knowledge Ingestion Reliability

## What This Is

Medical Arena is a dark, AI-native clinical decision-support mobile app (Expo/RN + Express backend) for practicing physicians and residents. Its knowledge layer — specialty topics organized by body system, each with categories for Emergencies, Clinical Topics, Tools & Diagnostics, and Recent Research — is populated by a backend "Autonomous Scientist Agent" that brainstorms topics, retrieves literature, synthesizes structured clinical content via LLMs, and writes to Supabase. This milestone makes that ingestion pipeline robust enough to fill every specialty with 50+ verified topics per category without manual babysitting.

## Core Value

A clinician can trust the reference: every specialty/category reaches its 50+ topic target with complete, well-formed clinical content — produced reliably by the pipeline, never silently missing or corrupted.

## Requirements

### Validated

Inferred from existing code (codebase map, 2026-08-04):

- ✓ Specialty browsing: 7 specialties (heart, git, fever, neuro, skin, women, lungs) with category drill-down — existing
- ✓ AI chat with medical section rendering (AIResponseCard, semantic sections, color tokens) — existing
- ✓ Backend AI router with multi-provider fallback (Groq → Gemini → NVIDIA → OpenRouter) — existing
- ✓ Scientist agent: brainstorm → keyword extraction → literature search → synthesis → Supabase insert pipeline — existing
- ✓ Knowledge lifecycle tables: knowledge_gaps, knowledge_review_queue, scientific_ledger — existing

### Active

- [ ] Ingestion pipeline survives malformed/truncated LLM output (JSON repair/extraction, no silent loss)
- [ ] Transient provider failures retried with backoff; failures logged to a durable place, not just console
- [ ] Interrupted expansion runs resumable (no nodemon restart wipes hours of work)
- [ ] Quota enforcement: every category demonstrably reaches 50+ topics; shortfalls auto-topped-up
- [ ] Content quality gates before ingestion (schema validation; review queue path preserved)

### Out of Scope

- New user-facing app features — this milestone is backend/pipeline reliability only
- Multi-region/scalable infra — single Node process is fine at current scale
- Switching off Gemini/Groq providers — router stays, hardening applies within it
- Real-time collaborative editing of topics — review queue remains the human gate

## Context

The Aug 25 pulmonology expansion log shows the failure modes concretely: `<think>` blocks leaking into JSON (`Unexpected token '<'`), truncated strings from the 4096 maxOutputTokens cap (`Unterminated string`), transient `[AI Router] Gemini failed ... Error fetching`, keyword extractor falling back repeatedly, and a nodemon restart discarding the entire run. The current code strips markdown fences and calls `JSON.parse` directly; per-topic failures are console.error'd once and never retried; there is no persisted run state. Existing schema contract per topic: title/subtitle/type/ai_scope_description/clinical_content[5 sections] written to `specialty_topics`. The old `.planning/1-CONTEXT.md` (UI decisions for AIResponseCard) remains valid for the frontend but is unrelated to this milestone.

## Constraints

- **Tech stack**: Node/Express CommonJS backend, @google/generative-ai SDK, Supabase JS client — work within these; no rewrite into another framework
- **Providers**: Free-tier keys (Gemini primary); rate limits are real — design around quotas, not against them
- **Cost**: Prefer free tiers; avoid doubling token spend per topic (retry budgets must be bounded)
- **Data safety**: Medical content — nothing auto-publishes past the knowledge_review_queue without passing validation gates
- **Windows dev environment**: Backend runs under nodemon on the user's laptop; long runs must tolerate restarts

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Treat ingestion reliability as the milestone core value | Log shows systemic failure, not bad luck; content volume is useless if unreliable | — Pending |
| Keep multi-provider router architecture | Already built; harden rather than replace | — Pending |
| Enforce 50+ per category with verification + top-up loop | User's explicit requirement ("each category be 50+ as it now fail") | — Pending |

---
*Last updated: 2026-08-25 after milestone initialization*
