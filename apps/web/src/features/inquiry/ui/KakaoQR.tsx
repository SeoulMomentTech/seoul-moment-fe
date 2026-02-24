"use client";

import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@seoul-moment/ui";

export default function KakaoQR() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <figure className="cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-90">
          <Image
            alt="Kakao QR Code"
            height={300}
            src="/qr/kakao.png"
            width={300}
          />
        </figure>
      </DialogTrigger>
      <DialogContent
        className="max-w-[90vw] border-none bg-transparent p-0 shadow-none sm:max-w-[500px]"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Kakao QR Code Enlarged</DialogTitle>
        <div className="relative aspect-square w-full">
          <Image
            alt="Kakao QR Code Enlarged"
            className="object-contain"
            fill
            src="/qr/kakao.png"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
