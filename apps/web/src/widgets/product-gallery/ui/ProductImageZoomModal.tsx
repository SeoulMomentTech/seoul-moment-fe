"use client";

import { XIcon } from "lucide-react";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { useMediaQuery } from "@shared/lib/hooks";
import { cn } from "@shared/lib/style";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@seoul-moment/ui";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface ProductImageZoomModalProps {
  images: string[];
  productName: string;
  open: boolean;
  startIndex: number;
  onOpenChange(open: boolean): void;
}

export default function ProductImageZoomModal({
  images,
  productName,
  open,
  startIndex,
  onOpenChange,
}: ProductImageZoomModalProps) {
  const t = useTranslations();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const viewer = (
    <Swiper
      className="h-full w-full"
      initialSlide={startIndex}
      modules={[Navigation, Pagination]}
      navigation={!isMobile}
      pagination={isMobile ? { type: "fraction" } : false}
      spaceBetween={10}
      style={{
        "--swiper-navigation-color": "#fff",
        "--swiper-pagination-color": "#fff",
        "--swiper-navigation-size": "30px",
      }}
    >
      {images.map((src, idx) => (
        <SwiperSlide className="h-full" key={`zoom-${src}-${idx + 1}`}>
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex aspect-square max-h-full w-full items-center justify-center bg-white sm:h-full sm:w-auto">
              <Image
                alt={`${productName} - ${idx + 1}`}
                className="h-full w-full object-contain"
                height={1200}
                sizes="(max-width: 640px) 100vw, 810px"
                src={src}
                width={1200}
              />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent
          className={cn(
            "bg-black",
            "data-[vaul-drawer-direction=bottom]:h-[100dvh]",
            "data-[vaul-drawer-direction=bottom]:max-h-[100dvh]",
            "data-[vaul-drawer-direction=bottom]:rounded-none",
          )}
        >
          <DrawerTitle className="sr-only">{productName}</DrawerTitle>
          <DrawerDescription className="sr-only" />
          <DrawerClose
            aria-label={t("close")}
            className="absolute right-4 top-4 z-10 text-white opacity-70 drop-shadow-[0_0_4px_rgba(0,0,0,0.7)] transition-opacity hover:opacity-100"
          >
            <XIcon className="size-6" />
          </DrawerClose>
          <div className="flex min-h-0 w-full flex-1 items-center overflow-hidden">
            {viewer}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="h-[90vh] max-h-[900px] w-[900px] max-w-[90vw] overflow-hidden border-none bg-black p-0 sm:max-w-[900px]"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{productName}</DialogTitle>
        <DialogDescription className="sr-only" />
        <DialogClose
          aria-label={t("close")}
          className="absolute right-4 top-4 z-10 text-white opacity-70 drop-shadow-[0_0_4px_rgba(0,0,0,0.7)] transition-opacity hover:opacity-100"
        >
          <XIcon className="size-6" />
        </DialogClose>
        <div className="flex h-full w-full items-center overflow-hidden">
          {viewer}
        </div>
      </DialogContent>
    </Dialog>
  );
}
