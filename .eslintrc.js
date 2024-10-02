module.exports = {
  env: {
    node: true,
  },
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended", // from @typescript-eslint/eslint-plugin
    "plugin:react-hooks/recommended", // from eslint-plugin-react-hooks
    "plugin:prettier/recommended", // from eslint-plugin-prettier
    "plugin:react/recommended", // from eslint-plugin-react
    "prettier", // from eslint-config-prettier
  ],
  plugins: ["prettier", "import", "react-native-unistyles"],
  /**
   * error: autofix가 불가능한 경우
   * warn: autofix가 가능한 경우
   */
  rules: {
    "new-cap": "error",
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-new-object": "error",
    "no-duplicate-imports": "error",
    "no-restricted-syntax": [
      "error",
      {
        selector:
          ':matches(PropertyDefinition, MethodDefinition)[accessibility="private"]',
        message: "Use #private instead",
      },
    ],

    "import/order": [
      "warn",
      {
        "newlines-between": "always",
        groups: [
          "index",
          "sibling",
          "parent",
          "internal",
          "external",
          "builtin",
          "object",
          "type",
        ],
        pathGroups: [
          {
            pattern: "react",
            group: "external",
            position: "before",
          },
        ],
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],

    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-use-before-define": [
      "error",
      { variables: false, functions: false, classes: true },
    ],

    "react/react-in-jsx-scope": "off", // 불필요하게 react 를 import 해야 해서, off 시켜놓음
    "react/jsx-curly-brace-presence": [
      "error",
      { props: "never", children: "never" },
    ],
    "no-restricted-imports": ["error", { patterns: ["@/features/*/*"] }],

    // unistyles custom rules
    "react-native-unistyles/no-unused-styles": "warn",
    "react-native-unistyles/sort-styles": [
      "warn",
      "asc",
      { ignoreClassNames: false, ignoreStyleProperties: false },
    ],
  },
  ignorePatterns: ["dist", "scripts"],
};
