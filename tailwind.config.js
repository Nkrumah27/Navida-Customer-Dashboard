/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0F2E5C",
        "navy-light": "#1C4B8C",
        gold: "#F4B400",
        "gold-deep": "#D89A00",
        ink: "#16233B",
        "ink-soft": "#4A5875",
        paper: "#F6F8FB",
        line: "#DDE3EE",
        danger: "#C24545",
        ok: "#1E8A5F",
      },
      fontFamily: {
        serif: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl2: "16px",
      },
    },
  },
  plugins: [],
};
