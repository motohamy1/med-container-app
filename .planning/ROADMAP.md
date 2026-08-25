# Roadmap: Medical Arena Knowledge Ingestion Reliability

**Milestone:** v1 — robust, reliable specialty ingestion (50+ topics per category)
**Defined:** 2026-08-25
**Project mode:** mvp (vertical slices; each phase leaves the pipeline better end-to-end)

## Phases

### Phase 1: Hardened AI Layer
**Goal:** Make every LLM call in the ingestion path produce parseable JSON and survive transient failures.
**Mode:** mvp
**Success Criteria**:
1. A test script replaying the Aug 25 failure classes (`<think>` preamble, truncated output, prose wrapper) yields parsed JSON for ≥ 95% of cases via the repair ladder
2. All synthesis/keyword calls use schema-constrained generation with token budgets sized to their schema
3. Transient errors retry with bounded exponential backoff; a forced-failure test shows recovery without topic loss
4. `node backend/server.js` starts clean with no regression to the chat path (/api/chat smoke test passes)

### Phase 2: Durable Job State & Resume
**Goal:** Expansion runs survive restarts; failed topics are retried, never silently lost; dedupe is race-safe.
**Mode:** mvp
**Success Criteria**:
1. Killing the server mid-expansion and restarting resumes from the exact remaining work items (zero re-synthesis of DONE topics)
2. Every brainstormed topic exists as a work-item row with terminal status DONE or FAILED (+ reason), never lost after one console.error
3. Concurrent/retry inserts cannot create duplicate topics (unique constraint proven by test)
4. Run state queryable: per-category counts + failure reasons visible via ledger/query

### Phase 3: Quota Enforcement & Top-Up Loop
**Goal:** Guarantee each category demonstrably reaches 50+ topics, auto-topping shortfalls within bounded rounds.
**Mode:** mvp
**Success Criteria**:
1. Post-ingest reconciliation reports actual vs target counts per (specialty, category)
2. A seeded shortfall triggers automatic top-up rounds that close the gap without duplicating existing titles
3. Max-rounds bound respected (no infinite loops); final report states met/unmet per category explicitly
4. One specialty (e.g., pulmonology) reaches 50+ in all four categories in a real run

### Phase 4: Validation Gates & Fleet-Wide Fill
**Goal:** No malformed topic enters the DB; run the hardened pipeline across all specialties to full fill.
**Mode:** mvp
**Success Criteria**:
1. Schema validation rejects malformed/incomplete clinical_content; rejects route to review queue/dead-letter with reasons (test-proven)
2. Full fill run across all 7 specialties completes with an explicit per-category met/unmet report
3. knowledge_review_queue path remains functional for human review of flagged content
4. Final ledger summary shows total topics added, failures dead-lettered, and categories at target

## Requirement Coverage Validation

| Req | Phase | Covered |
|-----|-------|---------|
| AIH-01..05 | 1 | ✓ |
| DPS-01..04 | 2 | ✓ |
| CQG-03 | 2 | ✓ |
| QEF-01..02 | 3 | ✓ |
| QEF-03, CQG-01..02 | 4 | ✓ |

All 15 v1 requirements mapped — 100% coverage ✓

---
*Last updated: 2026-08-25 after milestone initialization*
