"use client";

import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  Flex,
} from "@seoul-moment/ui";

export default function LineQR() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <figure className="cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-80">
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
        <Flex
          align="center"
          className="relative aspect-square w-full"
          justify="center"
        >
          <Image
            alt="Line QR Code Enlarged"
            height={200}
            src="/qr/line.png"
            width={200}
          />
        </Flex>
      </DialogContent>
    </Dialog>
  );
}
