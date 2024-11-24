import eslintPluginTypeScript from "@typescript-eslint/eslint-plugin";
import eslintParserTypeScript from "@typescript-eslint/parser";
import jsGlobals from "globals";

export default [
  {
    languageOptions: {
      parser: eslintParserTypeScript,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...jsGlobals.browser,
        ...jsGlobals.es2021,
        ...jsGlobals.node,
      },
    },
    plugins: {
      "@typescript-eslint": eslintPluginTypeScript,
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",
      "no-console": "warn",
      "no-debugger": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "prefer-const": "warn",
      "no-var": "error",
      "no-trailing-spaces": "error",
      "eol-last": ["error", "always"],
      "quotes": ["error", "single", { "avoidEscape": true }],
      semi: ["error", "always"],
      "no-multiple-empty-lines": ["error", { max: 1 }],
      indent: ["error", 2, { SwitchCase: 1 }],
      "arrow-body-style": ["warn", "as-needed"],
      "prefer-arrow-callback": "warn",
    },
  },
];
