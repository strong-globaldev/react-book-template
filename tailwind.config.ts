import type { Config } from "tailwindcss";

// Palette derived from Appainter (https://appainter.dev/) material export
const materialColors = {
  primary: {
    DEFAULT: "#0b70fe",
    on: "#ffffff",
    container: "#d9e2ff",
    onContainer: "#001945",
    inverse: "#a0cafd",
    dark: "#1976d2",
    light: "#bbdefb",
  },
  secondary: {
    DEFAULT: "#535f70",
    on: "#ffffff",
    container: "#d7e3f7",
    onContainer: "#101c2b",
  },
  tertiary: {
    DEFAULT: "#6b5778",
    on: "#ffffff",
    container: "#f2daff",
    onContainer: "#251431",
  },
  background: {
    DEFAULT: "#ffffff",
    on: "#191c20",
  },
  surface: {
    DEFAULT: "#ffffff",
    on: "#191c20",
    onVariant: "#43474e",
    containerHighest: "#e1e2e8",
    inverse: "#2e3135",
    inverseOn: "#eff0f7",
    tint: "#36618e",
  },
  error: {
    DEFAULT: "#ba1a1a",
    on: "#ffffff",
    container: "#ffdad6",
    onContainer: "#410002",
  },
  outline: {
    DEFAULT: "#73777f",
    variant: "#c3c7cf",
  },
  misc: {
    canvas: "#ffffff",
    card: "#ffffff",
    dialog: "#ffffff",
    indicator: "#ffffff",
    scaffold: "#ffffff",
    secondaryHeader: "#e3f2fd",
    scrim: "#000000",
    shadow: "#000000",
    divider: "rgba(25, 28, 32, 0.12)",
  },
  state: {
    disabled: "rgba(0, 0, 0, 0.38)",
    focus: "rgba(0, 0, 0, 0.12)",
    highlight: "rgba(188, 188, 188, 0.4)",
    hint: "rgba(0, 0, 0, 0.6)",
    hover: "rgba(0, 0, 0, 0.04)",
    icon: "rgba(0, 0, 0, 0.87)",
    splash: "rgba(200, 200, 200, 0.4)",
    unselected: "rgba(0, 0, 0, 0.54)",
  },
} as const;

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        material: materialColors,
      },
    },
  },
  plugins: [],
};

export default config;
