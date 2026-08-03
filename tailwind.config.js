/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Neutral graphite surfaces (cool, low-chroma)
        background: "#15161a",
        "deep-teal": "#1a1c21",
        "teal-dark": "#1b1d22",
        "teal-medium": "#23262c",
        "surface-hover": "#2c3036",
        // Refined teal accent (calmer chroma, hue 182)
        turquoise: "#44cabf",
        cyan: "#44cabf",
        "cyan-bright": "#6fd2c8",
        "accent-bright": "#6fd2c8",
        // Muted gold for highlights
        gold: "#d9b25a",
        "gold-warm": "#d9b25a",
        "gold-light": "#d9b25a",
        // Neutral tones
        charcoal: "#374151",
        "gray-dark": "#1f2937",
        "gray-muted": "#a7abb4",
        // Medicine card
        "medicine-bg": "#22252b",
        "medicine-card": "#191b20",
      },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(68, 202, 191, 0.28)",
        "glow-gold": "0 0 20px rgba(217, 178, 90, 0.3)",
        "bubble": "0 4px 12px rgba(0, 0, 0, 0.4)",
        "card": "0 8px 32px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
