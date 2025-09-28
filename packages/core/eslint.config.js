// @ts-check
import base from "../../eslint.config.js";
import { defineConfig } from "eslint/config";

export default defineConfig(...base, {
  languageOptions: {
    parserOptions: {
      project: "./tsconfig.json",
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
