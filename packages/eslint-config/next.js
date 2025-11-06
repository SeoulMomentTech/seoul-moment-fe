import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";

import react from "./react.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const reactWithoutIgnores = react.slice(0, -1);
const reactIgnoresConfig = react.at(-1);

const next = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...reactWithoutIgnores,
  reactIgnoresConfig,
];

export default next;
