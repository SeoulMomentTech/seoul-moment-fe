/**
 * 챗봇 패널 안의 스크롤 영역 공통 스타일 (메시지 리스트 · 입력창).
 *
 * `scrollbar-small`(globals.css)은 폭 8px 만 지정하고 thumb 색은 브라우저 기본값을
 * 쓴다. 좁은 패널에서는 기본 스크롤바가 과하게 눈에 띄므로 thumb 를 연한 회색
 * 알약 모양으로 낮추고 track 을 투명하게 만든다.
 *
 * `border` + `background-clip: padding-box` 로 8px 트랙 안에서 thumb 만 얇게
 * 보이게 한다. Firefox 는 의사요소를 지원하지 않아 `scrollbar-color-neutral` 이
 * `@supports` 가드 안에서 `scrollbar-color` 로 대신 처리한다.
 *
 * `scrollbar-color` 를 가드 없이 직접 붙이면 안 된다 — Chromium 이 표준 속성을
 * 발견하는 순간 아래 `::-webkit-scrollbar*` 규칙을 전부 무시해서, 커스텀 thumb 이
 * 시스템 기본 스크롤바로 되돌아간다.
 */
export const CHAT_SCROLLBAR = [
  "scrollbar-small",
  "scrollbar-color-neutral",
  "[&::-webkit-scrollbar-track]:bg-transparent",
  "[&::-webkit-scrollbar-thumb]:rounded-full",
  "[&::-webkit-scrollbar-thumb]:border-2",
  "[&::-webkit-scrollbar-thumb]:border-transparent",
  "[&::-webkit-scrollbar-thumb]:bg-neutral-subtle",
  "[&::-webkit-scrollbar-thumb]:bg-clip-padding",
  "hover:[&::-webkit-scrollbar-thumb]:bg-neutral/60",
].join(" ");
