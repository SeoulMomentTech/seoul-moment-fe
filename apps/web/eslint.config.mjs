import nextJsConfig from "@seoul-moment/eslint-config/next-js";

const config = [
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
