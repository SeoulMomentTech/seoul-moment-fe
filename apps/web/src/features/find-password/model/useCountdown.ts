import { useEffect, useRef, useState } from "react";

interface UseCountdownReturn {
  secondsLeft: number;
  isCounting: boolean;
  start(): void;
}

export function useCountdown(
  initialSeconds: number,
  onExpire?: () => void,
): UseCountdownReturn {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setTimeout(() => {
      setSecondsLeft((current) => {
        const next = current - 1;
        if (next <= 0) onExpireRef.current?.();
        return next;
      });
    }, 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft]);

  return {
    secondsLeft,
    isCounting: secondsLeft > 0,
    start: () => setSecondsLeft(initialSeconds),
  };
}
