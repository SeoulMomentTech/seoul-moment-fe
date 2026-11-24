/**
 * 서버가 준 남은 초(remainingSeconds)를 받은 시각부터 깎는다.
 * PC 시계와 무관하게 서버 기준을 유지하려고 절대 시각(readyAt)을 다시 계산하지 않는다.
 */
export const getRemainingSeconds = (
  serverRemainingSeconds: number,
  receivedAt: number,
  now: number,
) =>
  Math.max(
    0,
    serverRemainingSeconds - Math.floor((now - receivedAt) / 1000),
  );

/** `5시간 12분 남음`. 다 지났으면 null */
export const formatRemaining = (seconds: number) => {
  if (seconds <= 0) return null;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0 && minutes === 0) return "1분 미만 남음";
  if (hours === 0) return `${minutes}분 남음`;

  return `${hours}시간 ${minutes}분 남음`;
};
