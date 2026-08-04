/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Neutral graphite surfaces — even perceptual lightness ramp, hue 255, very low chroma
        background: "#101214",
        "deep-teal": "#14171a",
        "teal-dark": "#1a1d21",
        "teal-medium": "#23272c",
        "surface-hover": "#2d3238",
        // Signature accent — refined jewel teal, restrained chroma, hue 192
        turquoise: "#6ec2be",
        cyan: "#6ec2be",
        "cyan-bright": "#8ad9d5",
        "accent-bright": "#8ad9d5",
        // Champagne gold — muted, lower chroma
        gold: "#d2b689",
        "gold-warm": "#d2b689",
        "gold-light": "#d2b689",
        // Neutral tones
        charcoal: "#373d44",
        "gray-dark": "#24282d",
        "gray-muted": "#9ca3af",
        // Medicine card
        "medicine-bg": "#22262a",
        "medicine-card": "#171a1d",
      },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(110, 194, 190, 0.28)",
        "glow-gold": "0 0 20px rgba(210, 182, 137, 0.3)",
        "bubble": "0 4px 12px rgba(0, 0, 0, 0.4)",
        "card": "0 8px 32px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
