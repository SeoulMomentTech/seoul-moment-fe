"use client";

import Image from "next/image";

import { VStack } from "@seoul-moment/ui";

export default function LoginHeader() {
  return (
    <VStack gap={16}>
      <Image
        alt="Seoul Moment"
        height={24}
        priority
        src="/logo.png"
        width={204}
      />
      <p className="text-body-3 text-center leading-none text-black/60">
        서울모먼트에 오신 것을 환영합니다.
      </p>
    </VStack>
  );
}
