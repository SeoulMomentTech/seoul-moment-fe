"use client";

import Image from "next/image";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import useProductBanner from "../../model/useProductBanner";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./product-banner.css";

export default function ProductBanner() {
  const { data } = useProductBanner();

  return (
    <div className="mb-[40px] max-sm:mb-[20px]">
      <Swiper
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: {
            spaceBetween: 0,
          },
        }}
        className="product-banner"
        loop
        modules={[Pagination, Navigation, Autoplay]}
        pagination={{
          type: "bullets",
          clickable: true,
        }}
        slidesPerView="auto"
        spaceBetween={8}
      >
        {data.map((item) => (
          <SwiperSlide key={item.banner}>
            <figure className="h-[480px] overflow-hidden bg-slate-300 max-sm:h-[240px] max-sm:rounded-[4px]">
              <Image
                alt=""
                className="h-full object-cover"
                height={1000}
                src={item.banner}
                width={1340}
              />
            </figure>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
