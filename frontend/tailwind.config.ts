import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
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
          glow: "hsl(var(--accent-glow))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chat: {
          background: "hsl(var(--chat-background))",
          user: "hsl(var(--chat-user-bubble))",
          bot: "hsl(var(--chat-bot-bubble))",
          "user-text": "hsl(var(--chat-user-text))",
          "bot-text": "hsl(var(--chat-bot-text))",
        },
        mood: {
          happy: "hsl(var(--mood-happy))",
          chill: "hsl(var(--mood-chill))",
          energetic: "hsl(var(--mood-energetic))",
          sad: "hsl(var(--mood-sad))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "40%": { transform: "scale(1.08)" },
          "60%": { transform: "scale(0.96)" },
          "80%": { transform: "scale(1.02)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-8px) rotate(1deg)" },
          "66%": { transform: "translateY(-4px) rotate(-0.5deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--primary) / 0.6)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "20%": { transform: "rotate(-4deg)" },
          "40%": { transform: "rotate(4deg)" },
          "60%": { transform: "rotate(-2deg)" },
          "80%": { transform: "rotate(2deg)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "elastic-in": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "55%": { transform: "scale(1.08)", opacity: "1" },
          "70%": { transform: "scale(0.95)" },
          "85%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)" },
        },
        "slide-in-spring": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "60%": { transform: "translateX(4%)", opacity: "1" },
          "80%": { transform: "translateX(-1%)" },
          "100%": { transform: "translateX(0)" },
        },
        "breathe": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.05)", opacity: "1" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        "accordion-up": "accordion-up 0.25s cubic-bezier(0.4, 0, 1, 1)",
        "fade-in": "fade-in 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-in-from-bottom": "slide-in-from-bottom 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-in-from-bottom-2": "slide-in-from-bottom 0.3s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both",
        "bounce-in": "bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "float": "float 4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite",
        "pulse-glow": "pulse-glow 2.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "wiggle": "wiggle 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "scale-in": "scale-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-up": "slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        "elastic-in": "elastic-in 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-in-spring": "slide-in-spring 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "breathe": "breathe 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite",
        "gradient-shift": "gradient-shift 6s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
