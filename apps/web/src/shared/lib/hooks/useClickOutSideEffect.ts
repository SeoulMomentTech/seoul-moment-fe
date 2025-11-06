import { useCallback, useEffect, useRef } from "react";

type OneOrMore<T> = T | T[];

const useClickOutSideEffect = (
  container: OneOrMore<HTMLElement> | null,
  callback: VoidFunction,
) => {
  const containers = useRef<HTMLElement[]>([]);

  const handleClick = useCallback(
    ({ target }: MouseEvent | TouchEvent) => {
      const isNotValid = () =>
        target == null ||
        containers.current.length === 0 ||
        containers.current.some((x) => x.contains(target as Node));

      if (isNotValid()) return;

      callback();
    },
    [callback],
  );

  useEffect(() => {
    if (!container) return;

    containers.current = (
      Array.isArray(container) ? container : [container]
    ).filter((e) => e != null);
  }, [container]);

  useEffect(() => {
    document.addEventListener("click", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [handleClick]);
};

export default useClickOutSideEffect;
