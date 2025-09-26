/** @type {import('eslint').Linter.Config} */
const config = {
  root: true,
  extends: ["next/core-web-vitals"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  env: { browser: true, node: true, es2022: true },
  rules: {
    // Default (dev): warnings for console, stricter rules elsewhere
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "error",
    "no-alert": "warn",
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "no-script-url": "error",
    "no-var": "error",
    "prefer-const": "error",
    "prefer-arrow-callback": "error",
    "arrow-spacing": "error",
    "no-duplicate-imports": "error",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "warn",
    "@next/next/no-html-link-for-pages": "warn",
  },
};

if (process.env.NODE_ENV === "production") {
  // In production, fail on any console except warn/error
  config.rules["no-console"] = ["error", { allow: ["warn", "error"] }];
}

module.exports = config;


