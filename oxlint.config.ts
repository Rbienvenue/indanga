import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: [
    "import",
    "unicorn",
    "typescript",
    "oxc",
    "eslint",
    "react",
    "react-perf",
    "node",
  ],

  rules: {
    "no-debugger": "error",
    "no-empty": "warn",
    "eslint/no-unused-vars": "error",
    "typescript/no-floating-promises": "off",
    "typescript/no-explicit-any": "warn",
  },
});
