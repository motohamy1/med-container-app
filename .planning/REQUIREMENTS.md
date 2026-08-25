# Requirements: Medical Arena Knowledge Ingestion Reliability

**Defined:** 2026-08-25
**Core Value:** A clinician can trust the reference: every specialty/category reaches its 50+ topic target with complete, well-formed clinical content — produced reliably, never silently missing or corrupted.

## v1 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### AI Layer Hardening

- [ ] **AIH-01**: Every LLM call that expects JSON uses schema-constrained generation (Gemini `responseMimeType: application/json` + responseSchema) so valid JSON is the norm, not the exception
- [ ] **AIH-02**: All JSON-bearing responses pass through a parse-and-repair ladder (extract → repair attempt → dead-letter) instead of bare `JSON.parse`; a leaked `<think>` block or prose wrapper never loses a topic
- [ ] **AIH-03**: Synthesis calls have a maxOutputTokens budget sized to their schema (no more `Unterminated string` failures on 5-section topics)
- [ ] **AIH-04**: Transient provider errors (429, network fetch) retry with bounded exponential backoff + jitter before failing; quota-exhausted providers cool down instead of being hammered
- [ ] **AIH-05**: Keyword extraction failures no longer silently degrade search quality (retry via hardened layer; fallback path preserved as last resort)

### Durable Pipeline State

- [ ] **DPS-01**: An expansion run is a persisted job (specialty scope, status, progress counters) in Supabase — restart of the Node process does not lose it
- [ ] **DPS-02**: Each topic is a persisted work item (PENDING/RUNNING/DONE/FAILED, attempt_count, last_error) so failed topics are retried on resume, not lost after one console.error
- [ ] **DPS-03**: Interrupted runs auto-resume (on server start or explicit trigger) from exactly where they stopped
- [ ] **DPS-04**: Run/step/topic outcomes are queryable (admin or ledger view) showing per-category fill status and failure reasons

### Quota Enforcement & Fill

- [ ] **QEF-01**: After brainstorm ingestion, actual DB counts per (specialty, category) are reconciled against the 50+ target
- [ ] **QEF-02**: Categories short of target trigger automatic top-up rounds (new brainstorm excluding existing titles) until target met or a bounded max-rounds limit hits
- [ ] **QEF-03**: A fill run across all specialties completes with every category at 50+ verified topics, or ends with an explicit shortfall report (never silent)

### Content Quality Gates

- [ ] **CQG-01**: No topic is inserted unless it passes schema validation (all 5 clinical_content sections present and non-trivial)
- [ ] **CQG-02**: Validation-failed content routes to knowledge_review_queue (or dead-letter) with failure reason — never dropped silently
- [ ] **CQG-03**: Dedupe is race-safe (unique constraint on specialty + normalized title) so retries cannot create duplicate topics

## v2 Requirements

Deferred. Tracked but not in current roadmap.

### Observability & Ops

- **OBS-01**: Admin-panel dashboard for live expansion progress (beyond queryable tables)
- **OBS-02**: Scheduled automatic audits of all filled categories (cron-style drift detection)

### Content Depth

- **DEP-01**: Per-topic citation verification against live sources (URL liveness checks)
- **DEP-02**: Arabic-language content variants for bilingual study mode

## Out of Scope

| Feature | Reason |
|---------|--------|
| New user-facing app features | This milestone is pipeline reliability only |
| Provider swap (drop Gemini/Groq) | Router hardening applies within current architecture |
| Unbounded retries | Cost constraint: free-tier quotas; budgets must be bounded |
| Auto-publish without review gates | Medical data safety: review queue stays the human gate |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AIH-01 | Phase 1 | Pending |
| AIH-02 | Phase 1 | Pending |
| AIH-03 | Phase 1 | Pending |
| AIH-04 | Phase 1 | Pending |
| AIH-05 | Phase 1 | Pending |
| DPS-01 | Phase 2 | Pending |
| DPS-02 | Phase 2 | Pending |
| DPS-03 | Phase 2 | Pending |
| DPS-04 | Phase 2 | Pending |
| QEF-01 | Phase 3 | Pending |
| QEF-02 | Phase 3 | Pending |
| QEF-03 | Phase 4 | Pending |
| CQG-01 | Phase 4 | Pending |
| CQG-02 | Phase 4 | Pending |
| CQG-03 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-25*
*Last updated: 2026-08-25 after initial definition*
