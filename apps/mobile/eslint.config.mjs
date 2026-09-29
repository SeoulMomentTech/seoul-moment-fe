import reactJsConfig from "@seoul-moment/eslint-config/react-internal";
import { defineConfig, globalIgnores } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";

// eslint-config-expo 가 import/react 플러그인을 이미 등록한다. pnpm 이 peer 조합별로
// 다른 인스턴스를 설치해 공용 설정의 플러그인과 객체가 달라지므로("Cannot redefine plugin"),
// 겹치는 플러그인은 expo 쪽 등록만 남기고 공용 설정에서는 규칙만 가져온다.
const expoPlugins = new Set(
  expoConfig.flatMap((config) => Object.keys(config.plugins ?? {})),
);
const sharedConfig = reactJsConfig.map(({ plugins, ...config }) =>
  plugins
    ? {
        ...config,
        plugins: Object.fromEntries(
          Object.entries(plugins).filter(([name]) => !expoPlugins.has(name)),
        ),
      }
    : config,
);

// expo 는 @typescript-eslint 를 TS 파일에만 등록하지만 공용 설정의 TS 규칙은 files 제한이 없다.
// 같은 인스턴스를 전역으로 한 번 더 등록해 *.config.js 같은 JS 파일에서도 규칙을 찾게 한다.
const typescriptPlugin = expoConfig.find(
  (config) => config.plugins?.["@typescript-eslint"],
).plugins["@typescript-eslint"];

export default defineConfig([
  globalIgnores([
    "dist/**",
    ".expo/**",
    "expo-env.d.ts",
    "nativewind-env.d.ts",
  ]),
  expoConfig,
  { plugins: { "@typescript-eslint": typescriptPlugin } },
  ...sharedConfig,
  {
    files: ["**/*.config.{js,cjs,mjs}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/consistent-indexed-object-style": "off",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/shared/lib/hooks/query/useAppQuery.ts",
      "src/shared/lib/hooks/query/useAppMutation.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@tanstack/react-query",
              importNames: ["useQuery", "useMutation"],
              message: "useAppQuery 또는 useAppMutation을 사용하세요.",
            },
          ],
        },
      ],
    },
  },
]);
