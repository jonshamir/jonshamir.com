import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactThree from "@react-three/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import mdx from "eslint-plugin-mdx";
import _import from "eslint-plugin-import";
import compat from "eslint-plugin-compat";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compatC = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...fixupConfigRules(
    compatC.extends(
      "eslint:recommended",
      "plugin:import/recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:prettier/recommended",
      "plugin:mdx/recommended",
      "plugin:@typescript-eslint/recommended-type-checked",
      "plugin:@typescript-eslint/strict",
      "plugin:eslint-plugin-import/typescript",
      "plugin:eslint-comments/recommended",
      "plugin:react/jsx-runtime",
      "plugin:@react-three/recommended"
    )
  ),
  {
    plugins: {
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      react: fixupPluginRules(react),
      "react-hooks": fixupPluginRules(reactHooks),
      "@react-three": fixupPluginRules(reactThree),
      "react-hooks": fixupPluginRules(reactHooks),
      prettier: fixupPluginRules(prettier),
      mdx: fixupPluginRules(mdx),
      import: fixupPluginRules(_import),
      compat,
      "simple-import-sort": simpleImportSort,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        project: true,
        tsconfigRootDir: "/",
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      "react/no-unknown-property": "warn",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "import/first": "warn",
      "import/newline-after-import": "warn",
      "import/no-duplicates": "error",
      "import/no-named-as-default-member": "off",
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
    },
  },
  {
    files: ["**/.eslintrc.{js,cjs}"],

    languageOptions: {
      globals: {
        ...globals.node,
      },

      ecmaVersion: 5,
      sourceType: "commonjs",
    },
  },
];
