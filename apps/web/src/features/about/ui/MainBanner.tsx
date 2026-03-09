import Image from "next/image";

import { cn } from "@shared/lib/style";

export function MainBanner() {
  return (
    <section className="min-w-7xl relative h-[600px] pt-14 max-sm:min-w-full">
      <figure
        className={cn(
          "absolute flex h-full w-full items-center justify-center",
          "max-sm:px-5",
        )}
      >
        <Image
          alt="seoul moment"
          height={60}
          src="/about/seoul-moment.png"
          width={511}
        />
      </figure>
      <Image
        alt=""
        className="h-full object-cover"
        height={727}
        priority
        src="/about/seoul.webp"
        width={4000}
      />
    </section>
  );
}
