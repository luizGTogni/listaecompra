import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
    rules: {
      quotes: ["error", "single", { avoidEscape: true }],
      "comma-dangle": ["error", "never"],
      semi: ["error", "never"],
    },
  },
  tseslint.configs.recommended,
  prettier,
]);
