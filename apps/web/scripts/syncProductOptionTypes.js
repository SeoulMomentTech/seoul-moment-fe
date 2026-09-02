const fs = require("fs/promises");
const path = require("path");

// src/shared/services/product.ts 의 getProductOptions 와 같은 엔드포인트.
// ky 클라이언트를 그대로 import 하면 zustand / Sentry / next-intl 까지 딸려오므로
// 평범한 fetch 로 호출한다. 엔드포인트가 바뀌면 양쪽을 같이 고쳐야 한다.
const OPTION_ENDPOINT = "product/option";

// 타입은 운영 API 기준으로 고정 생성한다. src/shared/services/index.ts 의
// API_PREFIX_URL 기본값과 같은 주소.
const API_PREFIX_URL = "https://api.seoulmoment.com.tw";

const OUTPUT_PATH = path.resolve(
  __dirname,
  "../src/shared/services/generated/productOptionType.ts",
);

const fetchOptionTypes = async () => {
  const url = `${API_PREFIX_URL.replace(/\/$/, "")}/${OPTION_ENDPOINT}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status}`);
  }

  const body = await response.json();

  if (body?.result !== true || !Array.isArray(body?.data?.list)) {
    throw new Error(
      `Unexpected response shape from ${url}: ${JSON.stringify(body)}`,
    );
  }

  const types = body.data.list
    .map((option) => option?.type)
    .filter((type) => typeof type === "string" && type.length > 0);

  // 빈 응답으로 타입이 통째로 날아가는 걸 막는다.
  if (types.length === 0) {
    throw new Error(`No option types returned from ${url}; aborting.`);
  }

  // API 반환 순서가 흔들려도 생성물 diff 가 생기지 않도록 정렬한다.
  return [...new Set(types)].sort();
};

const renderFile = (types) =>
  [
    "// 이 파일은 자동 생성됩니다. 직접 수정하지 마세요.",
    "// 재생성: pnpm option:sync  (GET /product/option)",
    "",
    "export const OPTION_TYPES = [",
    ...types.map((type) => `  "${type}",`),
    "] as const;",
    "",
    "export type OptionType = (typeof OPTION_TYPES)[number];",
    "",
  ].join("\n");

async function generateProductOptionTypes() {
  const types = await fetchOptionTypes();

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, renderFile(types), "utf8");

  console.log(
    `[option:sync] ${types.length} option types written to ${path.relative(
      process.cwd(),
      OUTPUT_PATH,
    )}`,
  );
}

generateProductOptionTypes().catch((error) => {
  console.error(`[option:sync] ${error.message}`);
  process.exit(1);
});
