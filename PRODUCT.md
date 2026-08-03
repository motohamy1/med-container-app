# Product

## Register

product

## Users

Practicing physicians, residents, and clinical staff using the app at the point of care. They are time-pressed, evidence-driven, and skeptical of flashy UI. The job to be done is decision support on demand: consult an AI clinical assistant in a chat, study and search clinical specialties by body system, and run a drug / dose reference. They want answers fast and readable; they trust an interface that feels like a serious clinical tool, not a consumer game. "Physician Mode" is the primary surface (the profile shows patient/pharmacy adjuncts, but the core attribution is the clinician).

## Product Purpose

Medical Arena is a dark, AI-native clinical decision-support app. It combines an AI chat assistant (the "Chat Arena"), specialty-by-specialty study/search areas organized by body system (Heart, GIT, Fever, Neuro, Skin, Women, Lungs), and a drug/dose reference. The app mines a medical knowledge layer (Groq + Google AI + a medical retrieval set) to give clinicians grounded answers while they work. Success looks like a clinician in flow: search a specialty, ask the AI a nuanced question, get a dose or workup without fumbling the tool's affordances. The design must make the AI feel like a capable, calm colleague rather than a novelty.

## Brand Personality

Confident, precise, quietly authoritative. Three words: expert, calm, sharp. The emotional goal is trust earned through clarity and competence: feels like a well-made clinical instrument that gets out of the way of the work. Direction the team confirmed: more premium and more distinctive than the typical generic "dark AI" look, while staying clearly a tool for clinicians.

## Anti-references

- Generic "dark AI startup" templates (Space Grotesk + indigo-blue-purple gradient + glassy glitz). No default rounded-pill CTA stacks, no glow-for-glow's-sake.
- Consumer-gamified health apps (streaks, confetti, playful pastels). Clinicians are not patients being seduced.
- Cold, soulless enterprise SAAS dashboards that look hostile. It must stay confident but human — never careless with medical stakes.
- Blue/indigo everywhere. The teal/turquoise + warm-gold identity is already established; do not drift into the ubiquitous cool-blue dark palette.

## Design Principles

1. **Clinical confidence.** Every screen should read like an instrument a doctor can immediately trust. Earned familiarity: nothing strange, nothing decorative standing between the clinician and the task.
2. **Ink on a quiet surface.** Most of the app rests in calm deep teal darkness, accent reserved for the current state, primary action, and the gold signal. The specialty surfaces may carry one committed tonal color each, but restraint is the floor.
3. **Attribution and calm.** State-changing motion only — feedback, loading, reveal. No choreographed page-load sequences; a clinician watching a spinner is a clinician not working. 150-250ms transitions.
4. **Readability is patient safety.** Even with accessibility deprioritized, text over accent-heavy regions must clear its background by a real value gap. The medical chat, the drug lookups, the specialty text are always legible first.
5. **Distinctive through weight and warmth of identity.** Push beyond generic-dark-AI with a genuine teal/turquoise/gold system and crafted, specific type and geometry — recognizably "Medical Arena," never an off-the-shelf theme.

## Accessibility & Inclusion

WCAG AA contrast as a baseline for body text and controls; large touch targets consistent with mobile. Color is not the only signal (icon + text for key states). Respect system reduced-motion. Full a11y is noted as not a current priority, but the design keeps legibility and contrast in mind so it can be hardened later without a redesign.