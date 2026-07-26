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

  {
    // FSD 하향 전용 임포트 강제: app → views → widgets → features → entities → shared
    // 상위 레이어를 참조하면 error. 외부 라이브러리 임포트에는 적용되지 않는다.
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          basePath: import.meta.dirname,
          zones: [
            {
              target: "./src/shared",
              from: [
                "./src/entities",
                "./src/features",
                "./src/widgets",
                "./src/views",
                "./src/app",
              ],
            },
            {
              target: "./src/entities",
              from: [
                "./src/features",
                "./src/widgets",
                "./src/views",
                "./src/app",
              ],
            },
            {
              target: "./src/features",
              from: ["./src/widgets", "./src/views", "./src/app"],
            },
            {
              target: "./src/widgets",
              from: ["./src/views", "./src/app"],
            },
            {
              target: "./src/views",
              from: "./src/app",
            },
          ],
        },
      ],
    },
  },
];

export default config;
