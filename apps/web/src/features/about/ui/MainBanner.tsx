import Image from "next/image";

import { cn } from "@shared/lib/style";

export function MainBanner() {
  return (
    <section className="relative h-[600px] min-w-[1280px] pt-[56px] max-sm:min-w-full">
      <figure
        className={cn(
          "absolute flex h-full w-full items-center justify-center",
          "max-sm:px-[20px]",
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
