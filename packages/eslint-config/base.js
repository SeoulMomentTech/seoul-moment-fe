import importlint from "eslint-plugin-import";
import unusedImportslint from "eslint-plugin-unused-imports";

const base = [
  {
    plugins: {
      import: importlint,
      "unused-imports": unusedImportslint,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
            "unknown",
          ],
          pathGroups: [
            {
              pattern: "@",
              group: "external",
              position: "after",
            },
            {
              pattern: "@",
              group: "internal",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: [],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  {
    rules: {
      "@typescript-eslint/consistent-indexed-object-style": "error",
      "@typescript-eslint/consistent-type-definitions": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/method-signature-style": ["error", "method"],
    },
  },
  {
    ignores: ["scripts/**", "dist/**"],
  },
];

export default base;
