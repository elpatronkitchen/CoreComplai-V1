module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--corecomply-theme-primary, #111827)",
        accent: "var(--corecomply-theme-accent, #10B981)",
        surface: "var(--corecomply-theme-surface, #ffffff)",
        muted: "var(--corecomply-theme-muted, #6B7280)"
      },
      borderRadius: {
        lg: "var(--corecomply-radius-lg, 12px)",
        "2xl": "var(--corecomply-radius-2xl, 16px)"
      }
    }
  },
  plugins: []
};
