"use client";

import Image from "next/image";

import { cn } from "@shared/lib/style";

export interface BannerImageConfig {
  className?: string;
  height: number;
  src?: string;
  width: number;
}

export interface ResponsiveBannerProps {
  containerClassName?: string;
  desktop?: BannerImageConfig;
  mobile?: BannerImageConfig;
}

export function ResponsiveBanner({
  containerClassName,
  desktop,
  mobile,
}: ResponsiveBannerProps) {
  if (!desktop?.src && !mobile?.src) return null;

  return (
    <section className={containerClassName}>
      {desktop?.src && (
        <Image
          alt=""
          className={cn("h-full object-cover", desktop.className)}
          height={desktop.height}
          priority
          src={desktop.src}
          width={desktop.width}
        />
      )}
      {mobile?.src && (
        <Image
          alt=""
          className={cn("h-full object-cover", mobile.className)}
          height={mobile.height}
          priority
          src={mobile.src}
          width={mobile.width}
        />
      )}
    </section>
  );
}
