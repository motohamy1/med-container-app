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
  // Neutral graphite surfaces — quiet-teal ramp, hue pinned to 220°
  background: '#0e1314', // oklch(0.181 0.008 220)
  deepTeal: '#12181a', // oklch(0.203 0.009 220)
  tealDark: '#181e20', // oklch(0.229 0.010 220)
  tealMedium: '#21282a', // oklch(0.271 0.011 220)
  surfaceHover: '#2b3336', // oklch(0.315 0.012 220)

  // Signature accent — refined jewel teal
  accent: '#6ec2be', // oklch(0.760 0.082 191.6)
  accentBright: '#8ad9d5', // oklch(0.833 0.078 191.7)
  accentDeep: '#5aa8a4', // oklch(0.681 0.078 191.2) — gradient endpoint for filled bubbles

  // Champagne gold — muted signal (premium / featured), sole owner of hue ~79
  gold: '#d2b689', // oklch(0.790 0.068 79.3)
  clinicalGold: '#b8a273', // oklch(0.720 0.068 85) — same family at lower L for section color chips; never on the marker itself

  // Burnt terracotta — clinical caution / warning / destructive.
  // Hue pinned to 50° so both steps share one hue. Fills/borders only —
  // never body text on the dark background (raises L to >= 0.72 for text).
  terracotta: '#c37a4f', // oklch(0.647 0.108 50)
  terracottaDeep: '#95532a', // oklch(0.512 0.104 50)

  // Text & utility neutrals
  charcoal: '#353e41', // oklch(0.357 0.013 220)
  grayDark: '#232a2c', // oklch(0.278 0.010 220)
  grayMuted: '#9ca3af', // oklch(0.714 0.019 261.3) — secondary text (7.39:1)
  graySubtle: '#7b8188', // oklch(0.600 0.013 252) — placeholders, disabled (4.77:1 AA)
  textPrimary: '#ffffff', // oklch(1 0 0)
  textBody: '#e4e8ed', // oklch(0.929 0.008 253.9)
  ink: '#0e1314', // oklch(0.181 0.008 220) — text on filled accent surfaces

  // Medicine reference surfaces
  medicineBg: '#262d2f', // oklch(0.290 0.011 220)
  medicineCard: '#171d1f', // oklch(0.225 0.009 220)

  // Composer / floating islands
  islandBg: '#121719', // oklch(0.200 0.008 220)

  // Specialty palette — constant oklch(0.700 0.075 H), hue rotates evenly;
  // pulmonology keeps the accent hue exactly
  specialty: {
    cardiology: '#c98c87', // oklch(0.700 0.075 25)
    git: '#a9a069', // oklch(0.700 0.075 100) — olive, keeps clear of gold (~79°)
    infectious: '#79a3cb', // oklch(0.700 0.075 248)
    neurology: '#7dac86', // oklch(0.700 0.075 150)
    dermatology: '#9d97ca', // oklch(0.700 0.075 290)
    obgyn: '#bc8db1', // oklch(0.700 0.075 335)
    pulmonology: '#63aeaa', // oklch(0.700 0.075 191.6)
    more: '#9a9fa5', // oklch(0.700 0.010 250)
  },
} as const;

export type SpecialtyKey = keyof typeof Colors.specialty;
