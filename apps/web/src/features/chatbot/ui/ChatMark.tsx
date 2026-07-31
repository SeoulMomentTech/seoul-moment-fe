import type { ComponentProps } from "react";

/**
 * 어시스턴트 마크. 인라인 SVG 인 이유 —
 * `<Image alt="seoul moment">` 로 만들면 e2e/about-motion.spec.ts 의
 * `getByAltText("seoul moment", { exact: true })` 가 strict-mode 충돌한다.
 * 이 위젯 어디에서도 "seoul moment" 를 alt/aria-label 로 쓰지 않는다.
 *
 * 장식이므로 항상 aria-hidden. 화자 정보는 메시지마다 sr-only 텍스트가 따로 준다.
 */
export function ChatMark({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      viewBox="0 0 12 12"
      {...props}
    >
      {/* 셔터가 열린 조리개 — 브랜드가 '순간을 담는다'는 이름과 같은 도형 */}
      <circle cx="6" cy="6" fill="currentColor" r="6" />
      <path
        d="M6 2.4 9.6 6 6 9.6 2.4 6Z"
        fill="var(--color-background, #fff)"
        opacity="0.92"
      />
    </svg>
  );
}
