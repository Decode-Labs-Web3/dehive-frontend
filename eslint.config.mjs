import next from "eslint-config-next";

const config = [
  // Next.js flat config (includes core-web-vitals and TS rules)
  ...next,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "tailwind.config.js",
    ],
  },
  {
    // Relax new React 19 hook rules to fit current codebase
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/immutability": "off",
    },
  },
];

export default config;
