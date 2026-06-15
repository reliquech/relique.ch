import { nextJsConfig } from "./eslint-config/next.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    ignores: [
      ".cursor/**",
      ".agents/**",
      ".claude/**",
      "scripts/**",
      "next.config.js",
      "postcss.config.js",
      "tailwind.config.ts",
      "src/lib/ui/**",
      "src/lib/legacy/**",
      "src/components/ui/**",
    ],
  },
  {
    rules: {
      "react/prop-types": "off",
      "@next/next/no-img-element": "off",
      "react/no-children-prop": "off",
      "no-constant-binary-expression": "off",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react-hooks/exhaustive-deps": "off",
      "react/no-unescaped-entities": "off",
      "prefer-const": "off",
    },
  },
];
