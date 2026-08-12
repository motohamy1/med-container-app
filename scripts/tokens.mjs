// OKLCH -> sRGB hex token generator for the Medical Arena design system.
// Run: node scripts/tokens.mjs

function oklchToRgb(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb) => rgb.every((c) => c >= -0.0005 && c <= 1.0005);

function maxChroma(L, H) {
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToRgb(L, mid, H))) lo = mid;
    else hi = mid;
  }
  return lo;
}

function toHex(L, C, H) {
  const toSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  const rgb = oklchToRgb(L, C, H).map((c) =>
    Math.max(0, Math.min(255, Math.round(toSrgb(Math.max(0, Math.min(1, c))) * 255)))
  );
  return "#" + rgb.map((c) => c.toString(16).padStart(2, "0")).join("");
}

const tokens = {
  "primary-300": [0.85, 0.11, 45],
  "primary-400": [0.78, 0.14, 45],
  "primary-500": [0.72, 0.16, 45],
  "primary-600": [0.62, 0.17, 45],
  "primary-900": [0.24, 0.07, 45],
  "clinical-300": [0.83, 0.09, 192],
  "clinical-400": [0.75, 0.11, 192],
  "clinical-700": [0.45, 0.09, 192],
  "gold-300": [0.8, 0.08, 85],
  "gold-600": [0.55, 0.09, 85],
  "surface-0": [0.065, 0.012, 250],
  "surface-1": [0.095, 0.012, 250],
  "surface-2": [0.12, 0.012, 250],
  "surface-3": [0.16, 0.012, 250],
  "surface-4": [0.21, 0.012, 250],
  "text-primary": [0.92, 0.01, 250],
  "text-secondary": [0.7, 0.012, 250],
  "text-tertiary": [0.56, 0.012, 250],
};

const categories = {
  rose: 20,
  gold: 85,
  blue: 250,
  sage: 160,
  violet: 300,
  pink: 330,
  teal: 190,
};

for (const [name, [L, C, H]] of Object.entries(tokens)) {
  console.log(`${name}: ${toHex(L, C, H)}`);
}

for (const [name, H] of Object.entries(categories)) {
  const pastel = toHex(0.78, maxChroma(0.78, H) * 0.6, H);
  const border = toHex(0.5, maxChroma(0.5, H) * 0.6, H);
  console.log(`cat-${name}: ${pastel} / border ${border}`);
}
