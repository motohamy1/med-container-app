# AI Response Parser Template

Purpose
- Provide a small, deterministic set of parsing rules to convert free-form model output into the canonical `sections[]` JSON schema used by `AIResponseCard`.

Parsing strategy
1. Markdown/headings-first: If model output contains markdown-style headings (## Definition, ### Treatment), split by headings.
2. Regex header detection: Look for common section headings at line starts; case-insensitive. Patterns include:
   - ^Definition[:\-\s]
   - ^Classification[:\-\s]
   - ^Clinical Picture[:\-\s]
   - ^Presentation[:\-\s]
   - ^Diagnosis[:\-\s]
   - ^Investigations[:\-\s]
   - ^Treatment[:\-\s]
   - ^Management[:\-\s]
   - ^Follow[- ]?up[:\-\s]
   - ^Prognosis[:\-\s]
   - ^References[:\-\s]
3. Fallback sentence clustering: If no headings found, split into semantic chunks by paragraphs (double newlines) and label them using keyword heuristics (e.g., presence of 'treat', 'management' → Treatment; 'diagnos', 'investig' → Diagnosis).
4. Merge short adjacent sections: If a section has < 80 characters, consider merging with previous or next section.
5. Limit sections: If parsed sections > 8, collapse extras into "Additional Details".

Output schema
- sections: Array of { id, type, title, content }
- type should be one of the canonical types (definition, classification, clinical, diagnosis, treatment, followup, references, additional)

Example regex mapping (JS pseudo):

const HEADER_MAP = {
  definition: /^(?:#+\s*)?definition[:\-\s]/i,
  classification: /^(?:#+\s*)?classification[:\-\s]/i,
  clinical: /^(?:#+\s*)?(clinical picture|presentation|clinical features)[:\-\s]/i,
  diagnosis: /^(?:#+\s*)?(diagnosis|investigations|workup)[:\-\s]/i,
  treatment: /^(?:#+\s*)?(treatment|management|therapy)[:\-\s]/i,
  followup: /^(?:#+\s*)?(follow[- ]?up|prognosis)[:\-\s]/i,
  references: /^(?:#+\s*)?references?[:\-\s]/i,
};

Implementation notes
- The renderer (server or client) should prefer structured model outputs (JSON) when available.
- Provide unit tests with sample outputs to ensure parser stability.

