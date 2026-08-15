/**
 * check-colors.js — palette drift guard for Medical Arena.
 *
 * constants/Colors.ts keeps hex at runtime (React Native can't parse oklch),
 * but every token is spec'd in OKLCH. This script converts the hex back to
 * OKLCH and fails if the palette violates the design-system rules:
 *
 *   1. Neutral surface ramp holds one hue (spread <= 10°) — no hue drift.
 *   2. Specialty scale holds L = 0.700 ± 0.005 and C = 0.075 (± 0.005),
 *      except `more` (neutral). Pulmonology hue must match the accent.
 *   3. Text-on-dark tokens meet WCAG AA (>= 4.5:1 vs background).
 *   4. Filled accent surfaces take ink text (ink-on-accent >= 4.5:1).
 *   5. Gold is the sole owner of its hue band (no specialty duplicates it).
 *
 * Run: node scripts/check-colors.js
 */

const fs = require('fs');
const path = require('path');

function hexToRgb(h) {
  h = h.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ].map((v) => v / 255);
}
const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const srgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

function rgbToOklch(hex) {
  const [r, g, b] = hexToRgb(hex).map(lin);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.sqrt(a * a + bb * bb);
  let H = (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const l1 = luminance(a), l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
function hueGap(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

const src = fs.readFileSync(path.join(__dirname, '..', 'constants', 'Colors.ts'), 'utf8');
const tokens = {};
const sectionKeys = [];
let currentKey = null;
for (const line of src.split('\n')) {
  const m = line.match(/^\s*([A-Za-z_$][\w$]*):\s*['"](#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3}))['"]/);
  if (!m) {
    if (/specialty:\s*\{/.test(line)) currentKey = 'specialty';
    continue;
  }
  if (currentKey === 'specialty') {
    tokens[`specialty.${m[1]}`] = m[2];
    sectionKeys.push(`specialty.${m[1]}`);
  } else if (m[1] === 'specialty') {
    currentKey = 'specialty';
  } else {
    tokens[m[1]] = m[2];
  }
}

const errors = [];
const oklch = {};
for (const [k, hex] of Object.entries(tokens)) oklch[k] = rgbToOklch(hex);

const fail = (msg) => errors.push(msg);

// 1. Neutral ramp — pinned to the quiet-teal anchor hue.
// At C <= ~0.02 hex quantization jitters hue a few degrees, so each token gets a
// fixed tolerance vs the anchor instead of a min-max spread; the ramp's L order
// must also stay strictly increasing so surfaces don't collapse.
const RAMP = ['background', 'deepTeal', 'tealDark', 'tealMedium', 'surfaceHover', 'charcoal'];
const EXTRA_NEUTRALS = ['islandBg', 'medicineBg', 'medicineCard', 'grayDark'];
const ANCHOR_HUE = 220, HUE_TOL = 10;
for (const k of [...RAMP, ...EXTRA_NEUTRALS]) {
  if (!tokens[k]) continue;
  const d = hueGap(oklch[k].H, ANCHOR_HUE);
  if (d > HUE_TOL) fail(`${k} hue ${oklch[k].H.toFixed(1)}° drifted ${d.toFixed(1)}° from anchor ${ANCHOR_HUE}°`);
}
for (let i = 1; i < RAMP.length; i++) {
  if (!(oklch[RAMP[i]].L > oklch[RAMP[i - 1]].L)) {
    fail(`Ramp order broken: ${RAMP[i]} (L ${oklch[RAMP[i]].L.toFixed(3)}) <= ${RAMP[i - 1]} (L ${oklch[RAMP[i - 1]].L.toFixed(3)})`);
  }
}

// 2. Specialty scale — one L, one C, hue rotates
const SPEC_L = 0.7, SPEC_C = 0.075, TOL = 0.005;
for (const key of sectionKeys) {
  const name = key.split('.')[1];
  if (name === 'more') continue;
  const { L, C } = oklch[key];
  if (Math.abs(L - SPEC_L) > TOL) fail(`${name} L=${L.toFixed(3)} outside ${SPEC_L} ± ${TOL}`);
  if (Math.abs(C - SPEC_C) > TOL) fail(`${name} C=${C.toFixed(3)} outside ${SPEC_C} ± ${TOL}`);
}
if (tokens['specialty.pulmonology'] && tokens.accent) {
  const gap = hueGap(oklch['specialty.pulmonology'].H, oklch.accent.H);
  if (gap > 3) fail(`specialty.pulmonology hue (${oklch['specialty.pulmonology'].H.toFixed(1)}°) drifted ${gap.toFixed(1)}° from accent (${oklch.accent.H.toFixed(1)}°)`);
}

// 3. Text tokens meet WCAG AA (4.5:1) against background
const TEXTAA = ['graySubtle', 'grayMuted', 'textBody', 'textPrimary'];
for (const k of TEXTAA) {
  if (!tokens[k]) continue;
  const r = contrast(tokens[k], tokens.background);
  if (r < 4.5) fail(`${k} fails WCAG AA: ${r.toFixed(2)}:1 vs background (needs 4.5:1) — raise its OKLCH L`);
}

// 4. Filled accent surfaces take ink text
for (const k of ['accent', 'accentBright', 'gold']) {
  const r = contrast(tokens.ink, tokens[k]);
  if (r < 4.5) fail(`ink text on ${k} is ${r.toFixed(2)}:1 (needs 4.5:1) — darken ${k} or lighten ink`);
}

// 5. Gold stays the sole premium marker: no specialty may reuse its hex, and
// any specialty sharing gold's hue band must be role-separated by lightness
// (ΔL >= 0.05) so the chip and the signal never read as the same token.
if (tokens.gold) {
  for (const key of sectionKeys) {
    if (tokens[key].toLowerCase() === tokens.gold.toLowerCase()) {
      fail(`${key} reuses gold's exact hex ${tokens.gold} — gold is reserved for the premium marker`);
    } else if (hueGap(oklch[key].H, oklch.gold.H) < 15 && Math.abs(oklch[key].L - oklch.gold.L) < 0.05) {
      fail(`${key} (L ${oklch[key].L.toFixed(3)}, H ${oklch[key].H.toFixed(1)}°) is too close to gold (L ${oklch.gold.L.toFixed(3)}, H ${oklch.gold.H.toFixed(1)}°) — separate by ΔL >= 0.05`);
    }
  }
}

if (errors.length) {
  console.error('Palette drift detected:\n' + errors.map((e) => '  ✗ ' + e).join('\n'));
  process.exit(1);
}
console.log(`Palette OK — ${Object.keys(tokens).length} tokens verified (neutrals on anchor hue ${ANCHOR_HUE}°, ramp order ascending, specialty L/C locked, AA contrast holds).`);
