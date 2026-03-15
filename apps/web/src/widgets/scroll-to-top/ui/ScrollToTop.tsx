"use client";

import { ChevronUp } from "lucide-react";

import { useScrollToTop } from "@shared/lib/hooks";
import { Floating } from "@shared/ui/floating";

import { cn } from "@seoul-moment/ui";

interface ScrollToTopProps {
  className?: string;
}

export default function ScrollToTop({ className }: ScrollToTopProps) {
  const { isVisible, scrollToTop } = useScrollToTop();

  return (
    <Floating
      className={cn(
        "rounded-full border border-black/20 bg-white",
        isVisible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
        "shadow-[0px_0px_8px_0px_rgba(139, 89, 89, 0.12)] transition-all duration-300",
        className,
      )}
    >
      <button
        aria-label="Scroll to top"
        className={cn("max-sm:bottom-4 max-sm:right-4", className)}
        onClick={scrollToTop}
        type="button"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <ChevronUp className="text-black" size={20} />
        </div>
      </button>
    </Floating>
  );
}
