import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import importlint from "eslint-plugin-import";
import reactlint from "eslint-plugin-react";
import unusedImportslint from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      react: reactlint,
    },
    rules: {
      "react/button-has-type": "error",
      "react/jsx-pascal-case": "error",
      "react/jsx-filename-extension": [
        1,
        {
          extensions: [".tsx", ".jsx"],
        },
      ],
      "react/no-array-index-key": "error",
      "react/no-deprecated": "error",
      "react/self-closing-comp": [
        "error",
        {
          component: true,
          html: true,
        },
      ],
      "react/react-in-jsx-scope": "off",
      "react/jsx-sort-props": "error",
      "react/jsx-tag-spacing": [
        "error",
        {
          beforeSelfClosing: "always",
        },
      ],
    },
  },
  {
    plugins: {
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
    },
  },
  {
    plugins: {
      import: importlint,
    },
    rules: {
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
];

export default eslintConfig;
