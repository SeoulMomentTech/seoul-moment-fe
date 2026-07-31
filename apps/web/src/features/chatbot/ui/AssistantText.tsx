interface AssistantTextProps {
  text: string;
}

/**
 * 어시스턴트 답변은 **버블에 넣지 않는다**.
 *
 * 여기는 콘텐츠 플랫폼이고, 이 사이트의 콘텐츠는 회색 캡슐이 아니라 흰 바탕
 * 위 본문으로 앉는다. 긴 답변에 제대로 된 읽기 폭이 생기고, 시각적 소음이
 * 절반으로 줄며, 양방향 버블이라는 관례에서도 벗어난다.
 * 컨테이너를 갖는 쪽은 사용자 메시지뿐이다(UserBubble).
 */
export function AssistantText({ text }: AssistantTextProps) {
  return (
    <p className="text-body-3 text-foreground whitespace-pre-line leading-relaxed">
      {text}
    </p>
  );
}
