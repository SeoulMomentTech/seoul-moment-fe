import nextJsConfig from "@seoul-moment/eslint-config/next-js";

const config = [
  {
    // next lint 제거(Next 16)로 eslint를 직접 실행하므로 빌드 산출물을 명시적으로 무시한다.
    ignores: [
      ".next/**",
      "next-env.d.ts",
      "coverage/**",
      "playwright-report/**",
    ],
  },
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@tanstack/react-query",
              importNames: ["useQuery"],
              message: "useAppQuery를 사용하세요.",
            },
            {
              name: "@tanstack/react-query",
              importNames: ["useInfiniteQuery"],
              message: "useAppInfiniteQuery를 사용하세요.",
            },
            {
              name: "@tanstack/react-query",
              importNames: ["useMutation"],
              message: "useAppMutation을 사용하세요.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "**/useAppQuery.ts",
      "**/useAppInfiniteQuery.ts",
      "**/useAppMutation.ts",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },

  ...nextJsConfig,
];

export default config;
