"use client";

import { useCallback, useEffect, useState } from "react";

interface UseScrollToTopOptions {
  showThreshold?: number;
}

const useScrollToTop = ({
  showThreshold = 300,
}: UseScrollToTopOptions = {}) => {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        setIsVisible(scrollY > showThreshold);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showThreshold]);

  return {
    isVisible,
    scrollToTop,
  };
};

export default useScrollToTop;
