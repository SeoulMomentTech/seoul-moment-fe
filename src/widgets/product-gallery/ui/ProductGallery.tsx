"use client";

import Image from "next/image";
import { useState } from "react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import type { SwiperClass } from "swiper/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { cn } from "@/shared/lib/style";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

export default function ProductGallery() {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);

  return (
    <div
      className={cn(
        "w-[560px] gap-[17px] px-[20px]",
        "max-sm:w-full max-sm:px-0",
      )}
    >
      <Swiper
        className="mb-[17px]"
        modules={[FreeMode, Navigation, Thumbs]}
        navigation={true}
        spaceBetween={10}
        style={{
          "--swiper-navigation-color": "#fff",
          "--swiper-pagination-color": "#fff",
          "--swiper-navigation-sides-offset": "40px",
          "--swiper-navigation-size": "30px",
        }}
        thumbs={{ swiper: thumbsSwiper }}
      >
        <SwiperSlide>
          <Image
            alt=""
            height={800}
            src="https://swiperjs.com/demos/images/nature-1.jpg"
            unoptimized
            width={800}
          />
        </SwiperSlide>
        <SwiperSlide>
          <Image
            alt=""
            height={800}
            src="https://swiperjs.com/demos/images/nature-2.jpg"
            unoptimized
            width={800}
          />
        </SwiperSlide>
        <SwiperSlide>
          <Image
            alt=""
            height={800}
            src="https://swiperjs.com/demos/images/nature-3.jpg"
            unoptimized
            width={800}
          />
        </SwiperSlide>
        <SwiperSlide>
          <Image
            alt=""
            height={800}
            src="https://swiperjs.com/demos/images/nature-4.jpg"
            unoptimized
            width={800}
          />
        </SwiperSlide>
        <SwiperSlide>
          <Image
            alt=""
            height={800}
            src="https://swiperjs.com/demos/images/nature-5.jpg"
            unoptimized
            width={800}
          />
        </SwiperSlide>
      </Swiper>
      <Swiper
        className="mySwiper px-[20px]"
        freeMode={true}
        modules={[FreeMode, Navigation, Thumbs]}
        onSwiper={setThumbsSwiper}
        slidesPerView={8}
        spaceBetween={8}
        watchSlidesProgress={true}
      >
        <SwiperSlide>
          <Image
            alt=""
            height={800}
            src="https://swiperjs.com/demos/images/nature-1.jpg"
            unoptimized
            width={800}
          />
        </SwiperSlide>
        <SwiperSlide>
          <Image
            alt=""
            height={800}
            src="https://swiperjs.com/demos/images/nature-2.jpg"
            unoptimized
            width={800}
          />
        </SwiperSlide>
        <SwiperSlide>
          <Image
            alt=""
            height={800}
            src="https://swiperjs.com/demos/images/nature-3.jpg"
            unoptimized
            width={800}
          />
        </SwiperSlide>
        <SwiperSlide>
          <Image
            alt=""
            height={800}
            src="https://swiperjs.com/demos/images/nature-4.jpg"
            unoptimized
            width={800}
          />
        </SwiperSlide>
        <SwiperSlide>
          <Image
            alt=""
            height={800}
            src="https://swiperjs.com/demos/images/nature-5.jpg"
            unoptimized
            width={800}
          />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
