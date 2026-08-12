/**
 * Medical Arena — Design Tokens
 * Single source of truth for color. Consumed by tailwind.config.js
 * and by inline styles (Reanimated, LinearGradient, StatusBar).
 *
 * System rules (from PRODUCT.md):
 * - Ink on a quiet surface: graphite neutrals carry the app.
 * - Turquoise = current state / primary action only.
 * - Gold = signal/premium marker, used sparingly.
 * - Terracotta = clinical caution / warning / destructive, one job only.
 * - Specialty hues share one lightness & chroma (OKLCH L≈0.70, C≈0.075);
 *   only hue rotates, so no specialty feels louder than another.
 * - Filled accent surfaces always use ink text (#101214), never white.
 */

export const Colors = {
  // Neutral graphite surfaces — even perceptual ramp
  background: '#101214',
  deepTeal: '#14171a',
  tealDark: '#1a1d21',
  tealMedium: '#23272c',
  surfaceHover: '#2d3238',

  // Signature accent — refined jewel teal
  accent: '#6ec2be',
  accentBright: '#8ad9d5',
  accentDeep: '#5aa8a4', // gradient endpoint for filled bubbles

  // Champagne gold — muted signal (premium / featured)
  gold: '#d2b689',

  // Burnt terracotta — clinical caution / warning / destructive.
  // Muted chroma sibling of a "fabric orange": same warm hue family,
  // pulled down to L≈0.62 C≈0.10 so it harmonizes with the teal (split-
  // complementary ~145° away) instead of shouting over dark chrome.
  terracotta: '#c27a4e',
  terracottaDeep: '#96522c', // borders / fills at low alpha

  // Text & utility neutrals
  charcoal: '#373d44',
  grayDark: '#24282d',
  grayMuted: '#9ca3af',
  graySubtle: '#6b7178', // placeholders, disabled icons
  textPrimary: '#ffffff',
  textBody: '#e4e8ed',
  ink: '#101214', // text on filled accent surfaces

  // Medicine reference surfaces
  medicineBg: '#22262a',
  medicineCard: '#171a1d',

  // Composer / floating islands
  islandBg: '#16181c',

  // Specialty palette — constant lightness/chroma, hue rotates
  specialty: {
    cardiology: '#cf8a8a',
    git: '#d2b689',
    infectious: '#8ba3c7',
    neurology: '#74b3a0',
    dermatology: '#9a8fc4',
    obgyn: '#c48fb4',
    pulmonology: '#6ec2be',
    more: '#a3a8af',
  },
} as const;

export type SpecialtyKey = keyof typeof Colors.specialty;
