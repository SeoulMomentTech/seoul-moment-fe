import Image from "next/image";

import { cn } from "@seoul-moment/ui";

export function MainBanner() {
  return (
    <section
      className={cn(
        "relative h-[556px] min-w-[1280px] pt-[56px]",
        "max-sm:h-[656px] max-sm:min-w-full",
      )}
    >
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
