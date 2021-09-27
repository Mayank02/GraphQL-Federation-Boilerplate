// @see https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md
// @see https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/MONOREPO.md

module.exports = {
  plugins: ["@typescript-eslint", "jest", "prettier"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
    "prettier",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    project: "./tsconfig.json",
  },
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  settings: {
    "import/resolver": {
      alias: {
        map: [
          ["@graphql", "./app/src/graphql"],
          ["@screens", "./app/src/screens"],
          ["@utils", "./app/src/utils"],
        ],
        extensions: [".ts", ".js", ".json"],
      },
    },
  },
  rules: {
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        // force naming convention in code
        selector: "variable", // variables are either camelCase or UPPER_CASE for constants or PascalCase for functional components
        format: ["camelCase", "UPPER_CASE", "PascalCase"],
      },
      {
        selector: "interface", // interfaces must start with an I and be PascalCase
        format: ["PascalCase"],
        custom: {
          regex: "^I[A-Z]",
          match: true,
        },
      },
    ],
    "prettier/prettier": ["error"],
  },
  ignorePatterns: [
    ".eslintrc.js",
    "packages/example-server/*",
    "jest.config.js",
    "*/metro.config.js",
  ],
  overrides: [
    {
      files: ["*.test.js"],
      plugins: ["jest"],
      env: {
        es6: true,
        node: true,
        "jest/globals": true,
      },
      rules: {
        "@typescript-eslint/no-var-requires": 0,
      },
      extends: ["plugin:jest/recommended"],
      parserOptions: {
        ecmaVersion: 2019,
        sourceType: "module",
      },
    },
  ],
};
