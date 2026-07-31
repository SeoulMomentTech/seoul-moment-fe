/**
 * 점 3개가 튀는 인디케이터를 쓰지 않는다. 답변은 콘텐츠이므로 콘텐츠처럼
 * 로드되어야 한다 — 본문 폭 스켈레톤이 맞다.
 *
 * `@seoul-moment/ui` 의 Skeleton 도 쓰지 않는다: `animate-pulse bg-slate-200` 으로
 * 오프토큰 색이고 reduced-motion 가드가 없다. globals.css 의 `chat-shimmer` 는
 * `@media (prefers-reduced-motion: no-preference)` 안에 애니메이션을 두어
 * reduce 에서는 정적 회색 바로 남는다.
 *
 * 바 자체는 aria-hidden — 텍스트가 없어 일부 AT 가 빈 콘텐츠로 읽는다.
 * 낭독은 ChatThread 의 별도 role="status" 리전이 맡는다.
 */
export function ChatTypingIndicator() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2 py-0.5">
      <span className="chat-shimmer h-3.5 w-full rounded-full" />
      <span className="chat-shimmer h-3.5 w-3/5 rounded-full" />
    </div>
  );
}
