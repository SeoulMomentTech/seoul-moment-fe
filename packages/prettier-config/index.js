const overridableDefaults = {
  useTabs: false,
  printWidth: 80,
  tabWidth: 2,
  singleQuote: false,
  trailingComma: "all",
  endOfLine: "lf",
  semi: true,
  arrowParens: "always",
  bracketSpacing: true,
  htmlWhitespaceSensitivity: "css",
};

export default {
  ...overridableDefaults,
  plugins: ["prettier-plugin-packagejson", "prettier-plugin-tailwindcss"],
};
