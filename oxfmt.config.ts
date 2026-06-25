import { defineConfig } from "oxfmt";
export default defineConfig({
  sortImports: {
    groups: [
      ["value-builtin", "value-external"],
      ["value-internal", "value-parent", "value-sibling", "value-index"],
      { newlinesBetween: true },
      "type-import",
      "unknown",
    ],
  },
  jsdoc: true,
});