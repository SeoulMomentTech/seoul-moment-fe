"use client";

import Image from "next/image";
import { cn } from "@shared/lib/style";
import useHome from "../model/useHome";

export function MainBanner() {
  const { data } = useHome();

  return (
    <section
      className={cn(
        "h-[600px] min-w-[1280px] pt-[56px]",
        "max-sm:h-[350px] max-sm:min-w-full",
      )}
    >
      <picture>
        {data.banner.length > 1 && (
          <source
            media="(max-width: 680px)"
            srcSet={data.banner[1]}
            type="image/png"
          />
        )}
        <Image
          alt=""
          className="h-full object-cover object-top"
          height={727}
          priority
          src={data.banner[0]}
          width={4000}
        />
      </picture>
    </section>
  );
}
