# Phase 1 - CONTEXT: AI UI Response Rendering Decisions

Objective
- Define concrete, implementable UI decisions so downstream researchers and implementers can render AI model responses inside a single, elegant response card that is visually unique and harmonious with the app DNA.

High-level decisions (locked)
- Single-card container: All AI responses must be rendered inside one primary `AIResponseCard` container. No multi-card splits for a single model response. This ensures visual grouping and consistent affordance.
- Sectioned content: The AI response MUST be broken into semantic sections when the response contains multiple logical parts (e.g., Definition, Classification, Clinical Picture, Diagnosis, Treatment, Follow-up, References).
- Color-by-section: Each semantic section is assigned a distinct palette token (not raw hex sprinkled through code). Colors must be unique but harmonious and accessible against the global background.
- Theme-aware tokens: All colors should be declared as tokens that support light/dark modes and high-contrast accessibility.
- Max sections guardrail: Prefer up to 6 explicit sections for a single response. If the AI returns more, map extras to an "Additional" or collapse them under "Details".

Semantic Sections (recommended canonical list)
1. Definition
2. Classification
3. Clinical Picture
4. Diagnosis / Investigations
5. Treatment / Management
6. Follow-up / Prognosis
7. References (optional)

Color token mapping (dark-mode first; implementers add light-mode variants)
- token: `--ai-section-definition` → dark: `#a79ccc` (soft mauve)
- token: `--ai-section-classification` → dark: `#86b0d5` (muted blue)
- token: `--ai-section-clinical` → dark: `#7eb9a2` (muted green)
- token: `--ai-section-diagnosis` → dark: `#ccab7f` (warm gold)
- token: `--ai-section-treatment` → dark: `#d18c90` (warm rose)
- token: `--ai-section-followup` → dark: `#6ec2be` (teal)
- token: `--ai-section-references` → dark: `#a3a8af` (neutral)

Notes on colors
- Use these tokens only for section accents: header background strips, small left-color bars, icons, or subtle left edge indicators inside the card.
- Never use saturated full-bleed background color for a whole section — use low-opacity fills (8–18%) or thin borders to avoid visual noise.
- Provide light-mode variants (examples below) and ensure contrast ratio >= 4.5:1 for body text over section backgrounds or 3:1 for header accents.

Card layout and composition
- Component name: `AIResponseCard` (props documented below)
- Card container: rounded-2xl (16–18px), background: `--card-bg` (dark mode: `#161718` / alpha overlay), border: 1px solid `rgba(255,255,255,0.04)`, subtle shadow.
- Internal padding: 16px default; reduce to 12px on small screens.
- Each section is a vertical block with:
  - Small header row: left accent (4px wide vertical pill or 6px chip), `SectionTitle` (uppercase, 11–13px, token color), optional small icon.
  - Body: Typography: 14–15px body, line-height 20–24px; color `--text-primary`.
  - Section spacing: 12px between sections.
- Collapsible/expandable: Long sections can be truncated to 3 lines with an inline "Show more" that expands in-place.

Component API (React/React Native - example)
- `AIResponseCard` props:
  - `sections: Array<{ id: string; type: string; title?: string; content: string; colorToken?: string; icon?: string }>` — required
  - `variant?: 'default' | 'compact'` — optional
  - `onCopy?: (sectionId: string) => void` — optional
  - `onReferenceOpen?: (refId: string) => void` — optional
  - `maxCollapsedLines?: number` — default 3

Model → UI output schema (JSON contract)
- The model output should be post-processed by a server-side or client-side *renderer* that converts raw text into `sections[]` using heuristic or a small parser.
- Canonical JSON example:

{
  "model": "medarena-gpt-2",
  "prompt_id": "abc-123",
  "sections": [
    { "id": "def", "type": "definition", "title": "Definition", "content": "Short definition..." , "colorToken": "--ai-section-definition"},
    { "id": "class", "type": "classification", "title": "Classification", "content": "Classes: A, B...", "colorToken": "--ai-section-classification"},
    { "id": "treat", "type": "treatment", "title": "Treatment", "content": "Manage with X, Y...", "colorToken": "--ai-section-treatment"}
  ],
  "references": [ { "id":"r1","title":"Sepsis Guideline 202...","url":"https://..." } ]
}

Renderer responsibilities
- Parse and map free-form model output into canonical `sections[]` — use regex rules on section headers (e.g., /^Definition:/i, /^Treatment:/i) and fallback to NLP sentence clustering if ambiguous.
- Deduplicate overlapping content and merge small adjacent sections.
- If the model returns HTML or markdown, renderer should convert to safe, sanitized markdown -> renderable blocks (no raw HTML injection).
- Attach colorToken by mapping `type` → token via a small lookup table.

Micro-interactions and affordances
- Section header hover/tap: subtle scale + lift (0.02) and elevated shadow.
- Copy: each section can expose a trailing copy icon; tapping copies that section content and shows a transient toast.
- References: small pill icons open a modal / article view.

Accessibility
- All colors must meet contrast ratios. If token background is used, ensure sufficient contrast for text.
- Provide screen-reader labels for section titles and actions (e.g., "Definition section, 3 paragraphs").
- Keyboard focus ring for interactive elements.

Theming and tokens (suggested additions to tailwind / design tokens)
- Add token names to `tailwind.config.js` colors or central design token file:
  - `ai-section-definition`, `ai-section-classification`, `ai-section-clinical`, `ai-section-diagnosis`, `ai-section-treatment`, `ai-section-followup`, `ai-section-references`.
- Add `card-bg`, `card-border` tokens.

Acceptance criteria (for QA / implementer)
- Given a model response for "Sepsis Bundle", the UI renders a single `AIResponseCard` with clearly separated sections (Definition, Clinical Picture, Treatment, References).
- Section accents use the mapped tokens and are visually distinct yet harmonious with the app.
- The Log Out / persistent UI chrome must remain visible; the card must not overlap the tab bar or composer.
- Copy action works per section and triggers a small confirmation toast.
- Text remains selectable (when platform allows) and accessible.

Example visual specification (short)
- Card padding 16px, radius 16px, bg `--card-bg` (#161718), border `--card-border` rgba(255,255,255,0.04).
- Section header: left 6px color bar, title uppercase 11px bold using color token.
- Section body: 14px, color `--text-primary` (#e4e8ed).

Implementation tasks for downstream agents
1. Researcher: propose small parser rules and a short list of regex patterns for section detection (Definition, Treatment, etc.) and produce test cases from sample model outputs.
2. Planner: implement `AIResponseCard` component with props above; wire color tokens; create unit tests and an accessible example screen.
3. Frontend: integrate renderer output -> `sections[]` and render in `ChatTab` using `ChatBubble`/`AIResponseCard` placement; ensure spacing with composer and tab bar.
4. QA: run acceptance tests with 5 sample prompts (Sepsis Bundle, Hypertensive Crisis, ACS Protocol, Liver Scoring, Anticoagulation) and confirm layout, colors, accessibility.

Deliverables
- This file: `.planning/1-CONTEXT.md` (decisions & tokens).
- Suggested follow-ups: `templates/ai-response-parser.md`, `components/AIResponseCard.tsx`, `tests/ai-response-parser.test.ts`.

Notes / Open questions for the user
- Do you want section colors to be strictly fixed to tokens above, or allow model to suggest alternative palettes per response (e.g., theme per specialty)? Current recommendation: keep tokens fixed for consistency.
- Preferred max characters per section before collapsing? Default is 600 characters.

End of CONTEXT
