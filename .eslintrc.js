module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    "eslint:recommended", // Eslint recommended configuration by eslint.
    "plugin:import/recommended", // Linting of ES2015+ import/export syntax.
    "plugin:react/recommended", // Recommended react linting configs.
    "plugin:react-hooks/recommended", // Recommended react hooks linting configs.
    "plugin:jsx-a11y/recommended", // Turns on a11y rules for JSX.
    "plugin:@typescript-eslint/recommended", // Turns on rules from TypeScript-specific plugin.
    "plugin:prettier/recommended", // Turns off all rules that are unnecessary or might conflict with Prettier.
    "plugin:mdx/recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/strict",
    "plugin:eslint-plugin-import/typescript",
    "plugin:eslint-comments/recommended",
    "plugin:react/jsx-runtime",
    "plugin:@react-three/recommended",
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
    ecmaVersion: "latest",
    sourceType: "module",
  },
  settings: {
    react: {
      version: "detect", // auto-detect React version from package.json.
    },
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "@react-three",
    "react-hooks",
    "jsx-a11y",
    "prettier",
    "mdx",
    "import",
    "compat",
    "simple-import-sort",
  ],
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
};
