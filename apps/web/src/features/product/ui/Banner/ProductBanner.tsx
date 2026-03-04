"use client";

import Image from "next/image";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { useRouter } from "@/i18n/navigation";
import { isInternalUrl } from "@/shared/lib/utils";

import { cn } from "@seoul-moment/ui";

import useProductBanner from "../../model/useProductBanner";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./product-banner.css";

export default function ProductBanner() {
  const { data } = useProductBanner();
  const router = useRouter();

  const handleClick = (url: string | null) => {
    if (!url) return;

    if (isInternalUrl(url)) {
      const path = url.replace("https://seoulmoment.com.tw", "");
      router.push(path);
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

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
            <figure
              className={cn(
                "h-[480px] overflow-hidden bg-slate-300 max-sm:h-[240px] max-sm:rounded-[4px]",
                item.url && "cursor-pointer",
              )}
              onClick={() => handleClick(item.url)}
              role={item.url ? "link" : undefined}
              tabIndex={item.url ? 0 : -1}
            >
              <Image
                alt=""
                className="h-full object-cover max-sm:hidden"
                height={1000}
                src={item.banner}
                width={1340}
              />
              {item.mobileBanner && (
                <Image
                  alt=""
                  className="hidden h-full object-cover max-sm:block"
                  height={480}
                  src={item.mobileBanner}
                  width={640}
                />
              )}
            </figure>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
