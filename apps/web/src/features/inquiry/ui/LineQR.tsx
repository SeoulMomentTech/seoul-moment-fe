"use client";

import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@seoul-moment/ui";

export default function LineQR() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <figure className="cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-90">
          <Image
            alt="Line QR Code"
            height={120}
            src="/qr/line.png"
            width={120}
          />
        </figure>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] border-none bg-transparent p-0 shadow-none sm:max-w-[500px]">
        <DialogTitle className="sr-only">Line QR Code Enlarged</DialogTitle>
        <div className="relative aspect-square w-full">
          <Image
            alt="Line QR Code Enlarged"
            className="object-contain"
            fill
            src="/qr/line.png"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
