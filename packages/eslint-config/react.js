import reactlint from "eslint-plugin-react";

import base from "./base.js";

const baseWithoutIgnores = base.slice(0, -1);
const baseIgnoresConfig = base.at(-1);

const react = [
  ...baseWithoutIgnores,
  {
    plugins: {
      react: reactlint,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/button-has-type": "error",
      "react/jsx-filename-extension": [
        1,
        {
          extensions: [".tsx", ".jsx"],
        },
      ],
      "react/jsx-pascal-case": "error",
      "react/jsx-sort-props": "error",
      "react/jsx-tag-spacing": [
        "error",
        {
          beforeSelfClosing: "always",
        },
      ],
      "react/no-array-index-key": "error",
      "react/no-deprecated": "error",
      "react/react-in-jsx-scope": "off",
      "react/self-closing-comp": [
        "error",
        {
          component: true,
          html: true,
        },
      ],
    },
  },
  baseIgnoresConfig,
];

export default react;
