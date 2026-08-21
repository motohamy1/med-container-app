/**
 * Medical Arena — Design Tokens
 * Single source of truth for color. Consumed by tailwind.config.js
 * and by inline styles (Reanimated, LinearGradient, StatusBar).
 *
 * React Native cannot parse oklch() at runtime, so tokens stay hex —
 * but every token is SPEC'D in OKLCH (comment). scripts/check-colors.js
 * converts back to OKLCH and fails CI if the palette drifts:
 * - neutral ramp: hue spread <= 10° (quiet-teal, H = 220)
 * - specialty scale: L = 0.700 ± 0.005, C = 0.075 (except "more")
 * - text tokens: WCAG >= 4.5:1 vs background
 * - filled accent surfaces: ink text >= 4.5:1
 *
 * System rules (from PRODUCT.md):
 * - Ink on a quiet surface: graphite neutrals carry the app.
 * - Turquoise = current state / primary action only.
 * - Gold = signal/premium marker, used sparingly, sole owner of hue ~79.
 * - Terracotta = clinical caution / warning / destructive, one job only.
 * - Specialty hues share one lightness & chroma; only hue rotates,
 *   so no specialty feels louder than another.
 * - Filled accent surfaces always use ink text, never white.
 */

export const Colors = {
  // Neutral graphite surfaces — quiet-teal ramp on sleek minimal pitch black
  background: '#010101', // ultra-sleek minimal dark OLED pitch black
  deepTeal: '#080c0d',
  tealDark: '#0e1416',
  tealMedium: '#141b1d',
  surfaceHover: '#1c2527',

  // Four Main Core Colors (User Palette)
  main: '#defff9',          // Main App Color — Luminous Frosted Aqua Mint
  accent: '#defff9',        // Primary highlight / brand action color
  teal: '#6dc2bd',          // Medical Jewel Teal / Cyan Contrast
  lavender: '#dbd4fd',      // Soft Lavender / Periwinkle
  pink: '#ffc3dd',          // Pastel Rose Pink
  lime: '#defff9',          // Mapped to main #defff9 for backward compatibility

  // Harmonized Gradient & Functional Aliases
  accentBright: '#defff9',
  accentDeep: '#6dc2bd',
  gold: '#dbd4fd',          // Soft Lavender / Periwinkle for signal highlights & badges
  clinicalGold: '#dbd4fd',  // Soft Lavender for secondary clinical badges
  terracotta: '#ffc3dd',    // Pastel Rose for alerts, pitfalls, and critical markers
  terracottaDeep: '#e08ca9',

  // Text & utility neutrals
  charcoal: '#263033',
  grayDark: '#161c1e',
  grayMuted: '#9ca3af',
  graySubtle: '#7b8188',
  textPrimary: '#ffffff',
  textBody: '#e4e8ed',
  ink: '#010101',

  // Medicine reference surfaces
  medicineBg: '#151d1f',
  medicineCard: '#090e0f',

  // Composer / floating islands
  islandBg: '#090d0e',
  tabIslandBg: '#040808',

  // Specialty palette — harmonized using the 4 main palette colors (#defff9, #ffc3dd, #dbd4fd, #6dc2bd)
  specialty: {
    cardiology: '#ffc3dd',  // Pastel Pink
    git: '#defff9',         // Main Ice Mint
    infectious: '#6dc2bd',  // Jewel Teal
    neurology: '#dbd4fd',   // Soft Lavender
    dermatology: '#ffc3dd', // Pastel Pink
    obgyn: '#dbd4fd',       // Soft Lavender
    pulmonology: '#6dc2bd', // Jewel Teal
    more: '#defff9',        // Main Ice Mint
  },
} as const;

export type SpecialtyKey = keyof typeof Colors.specialty;

