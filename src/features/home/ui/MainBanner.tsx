"use client";

import Image from "next/image";
import useHome from "../model/useHome";

export function MainBanner() {
  const { data } = useHome();

  return (
    <section className="h-[690px]">
      <picture>
        <Image
          alt=""
          className="h-full object-cover"
          height={727}
          src={data.banner[0]}
          width={4000}
        />
        {data.banner.length > 1 && (
          <source
            media="max-width: 680px"
            srcSet={data.banner[1]}
            type="image/png"
          />
        )}
      </picture>
    </section>
  );
}
