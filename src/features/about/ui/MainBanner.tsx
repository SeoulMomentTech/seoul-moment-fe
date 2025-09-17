import Image from "next/image";
import { cn } from "@/shared/lib/style";

export function MainBanner() {
  return (
    <section className="relative h-[600px] pt-[56px]">
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
        src="/about/seoul.png"
        width={4000}
      />
    </section>
  );
}
