import { useEffect, type RefObject } from "react";

interface UseIntersectionObserverProps {
  target: RefObject<Element | null>;
  onIntersect(): void;
  enabled?: boolean;
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

const useIntersectionObserver = ({
  target,
  onIntersect,
  enabled = true,
  root,
  rootMargin,
  threshold,
}: UseIntersectionObserverProps) => {
  useEffect(() => {
    if (!enabled) return;

    const element = target.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      {
        root,
        rootMargin,
        threshold,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [enabled, onIntersect, root, rootMargin, target, threshold]);
};

export default useIntersectionObserver;
