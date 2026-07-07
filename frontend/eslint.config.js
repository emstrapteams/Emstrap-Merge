import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // ================================
  // IGNORE BUILD / DEPENDENCIES
  // ================================
  globalIgnores([
    "dist",
    "node_modules",
    "coverage",
  ]),

  // ================================
  // MAIN CONFIG
  // ================================
  {
    files: ["**/*.{js,jsx}"],

    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        ...globals.browser,
      },

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {
      // ================================
      // GENERAL CLEAN CODE
      // ================================
      "no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^[A-Z_]",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      "no-console": "off",
      "no-debugger": "warn",

      // ================================
      // REACT SAFETY (IMPORTANT FOR YOUR SYSTEM)
      // ================================
      "react-hooks/exhaustive-deps": "warn",

      // Prevent silent UI bugs in live systems
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
]);