module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        darkBg: '#2e2e2e',           // Charcoal grey background
        cardBg: '#1f1f1f',           // Darker grey card background
        primaryGreen: '#00cc66',     // Vibrant green (buttons/accents)
        primaryGreenHover: '#00994d',// Darker green for hover states
        borderGreen: '#00cc66',      // Green for borders
        textLight: '#ffffff',        // White text
        textMuted: '#a0a0a0',        // Muted gray for less emphasis
      },
    },
  },
  plugins: [],
};
