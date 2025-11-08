// @ts-check
import base from "../../eslint.config.js";
import { defineConfig } from "eslint/config";

export default defineConfig(base, {
  files: ["**/*.{ts,tsx}"],
  rules: {
    // Allow TanStack Router's redirect to be thrown
    "no-throw-literal": "off",
    "@typescript-eslint/no-throw-literal": "off",
    "@typescript-eslint/only-throw-error": "off",
  },
});
