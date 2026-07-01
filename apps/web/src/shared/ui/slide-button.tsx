"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { SwiperClass } from "swiper/react";
import { useSwiper } from "swiper/react";

import { cn } from "@shared/lib/style";

import { Button } from "@seoul-moment/ui";

type SlideButtonType = "prev" | "next";

interface SlideButtonConfig {
  position: string;
  Icon: LucideIcon;
  move(swiper: SwiperClass): void;
}

const SLIDE_BUTTON: Record<SlideButtonType, SlideButtonConfig> = {
  prev: {
    position: "left-[14px] top-[40%]",
    Icon: ChevronLeft,
    move: (swiper) => swiper.slidePrev(),
  },
  next: {
    position: "right-[14px] top-[40%]",
    Icon: ChevronRight,
    move: (swiper) => swiper.slideNext(),
  },
};

interface SlideButtonProps {
  type: SlideButtonType;
  disabled?: boolean;
}

const SlideButton = ({ type, disabled }: SlideButtonProps) => {
  const swiper = useSwiper();
  const { position, Icon, move } = SLIDE_BUTTON[type];

  return (
    <Button
      className={cn(
        "z-2 absolute max-sm:hidden",
        "h-[32px] w-[32px] rounded-full border border-white/20 bg-white p-0 shadow-sm",
        "hover:bg-white",
        "disabled:cursor-not-allowed disabled:bg-white disabled:opacity-40",
        position,
      )}
      disabled={disabled}
      onClick={() => move(swiper)}
    >
      <Icon className="text-black" height={24} width={24} />
    </Button>
  );
};

export default SlideButton;
