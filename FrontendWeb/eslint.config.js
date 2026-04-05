import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: globals.browser,
    },
    plugins: {
      js,
      react: pluginReact,
      "react-x": reactX,
      "react-dom": reactDom,
    },
    rules: {
      ...reactX.configs["recommended-typescript"].rules,
      ...reactDom.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
    },
  },
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...tseslint.configs.strictTypeChecked,
]);
