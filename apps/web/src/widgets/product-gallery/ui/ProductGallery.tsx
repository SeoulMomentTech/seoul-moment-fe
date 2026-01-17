"use client";

import { useState } from "react";

import Image from "next/image";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import type { SwiperClass } from "swiper/react";
import { Swiper, SwiperSlide } from "swiper/react";

import { cn } from "@shared/lib/style";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);

  return (
    <div
      className={cn(
        "w-[560px] gap-[17px] px-[20px]",
        "max-sm:w-full max-sm:px-0",
      )}
    >
      <Swiper
        className={cn(
          "mb-[17px] h-[560px] w-[560px]",
          "max-sm:aspect-square max-sm:h-auto max-sm:w-full",
        )}
        modules={[FreeMode, Navigation, Thumbs]}
        navigation={true}
        spaceBetween={10}
        style={{
          "--swiper-navigation-color": "var(--color-brand-foreground)",
          "--swiper-pagination-color": "var(--color-brand-foreground)",
          "--swiper-navigation-sides-offset": "40px",
          "--swiper-navigation-size": "30px",
        }}
        thumbs={{ swiper: thumbsSwiper }}
      >
        {images.map((src, idx) => (
          <SwiperSlide key={`${src}-${idx + 1}`}>
            <Image
              alt=""
              className="h-full"
              height={800}
              src={src}
              unoptimized
              width={800}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="px-[20px]">
        <Swiper
          className="mySwiper"
          freeMode={true}
          modules={[FreeMode, Navigation, Thumbs]}
          onSwiper={setThumbsSwiper}
          slidesPerView={8}
          spaceBetween={8}
          watchSlidesProgress={true}
        >
          {images.map((src, idx) => (
            <SwiperSlide key={`sub-${src}-${idx + 1}`}>
              <Image
                alt=""
                className="object-contain"
                height={800}
                src={src}
                unoptimized
                width={800}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
