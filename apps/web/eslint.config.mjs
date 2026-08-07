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
    // eslint-config-next 16이 번들하는 eslint-plugin-react-hooks v7의 React Compiler
    // 신규 룰. 기존 코드에서 18건(set-state-in-effect 15, refs 3)이 걸리고,
    // optimistic like 토글처럼 동작에 민감한 로직이 포함돼 의존성 업그레이드와 함께
    // 고칠 수 없다. 별도 PR에서 effect/ref를 정리한 뒤 하나씩 다시 켠다.
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/incompatible-library": "off",
    },
  },

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
