import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

import react from "./react.js";

const reactWithoutIgnores = react.slice(0, -1);
const reactIgnoresConfig = react.at(-1);

// eslint-config-next 16부터 flat config를 직접 내보내므로 FlatCompat 없이 스프레드한다.
// core-web-vitals는 @typescript-eslint 플러그인/파서만 등록하고 규칙은 넣지 않으므로,
// 기존 `next/typescript` 확장과 동일한 규칙 세트를 유지하려면 typescript도 함께 포함해야 한다.
const next = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  ...reactWithoutIgnores,
  reactIgnoresConfig,
];

export default next;
