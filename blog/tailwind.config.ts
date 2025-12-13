import type { Config } from "tailwindcss";

const config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        shark: {
          "50": "var(--color-shark-50)",
          "100": "var(--color-shark-100)",
          "200": "var(--color-shark-200)",
          "300": "var(--color-shark-300)",
          "400": "var(--color-shark-400)",
          "500": "var(--color-shark-500)",
          "600": "var(--color-shark-600)",
          "700": "var(--color-shark-700)",
          "800": "var(--color-shark-800)",
          "900": "var(--color-shark-900)",
          "950": "var(--color-shark-950)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        note: {
          border: "var(--note-border)",
          background: "var(--note-background)",
          text: "var(--note-text)",
          icon: "var(--note-icon)",
        },
        tip: {
          border: "var(--tip-border)",
          background: "var(--tip-background)",
          text: "var(--tip-text)",
          icon: "var(--tip-icon)",
        },
        warning: {
          border: "var(--warning-border)",
          background: "var(--warning-background)",
          text: "var(--warning-text)",
          icon: "var(--warning-icon)",
        },
        caution: {
          border: "var(--caution-border)",
          background: "var(--caution-background)",
          text: "var(--caution-text)",
          icon: "var(--caution-icon)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
