"use client";

import { Button } from "@seoul-moment/ui";
import Image from "next/image";
import Link from "next/link";

export default function GlobalError() {
  return (
    <div className="flex flex-col items-center gap-[60px] pt-[156px] max-sm:px-[20px] max-sm:pt-[136px]">
      <div className="flex flex-col items-center gap-[30px] text-center">
        <div className="flex flex-col items-center gap-[12px]">
          <figure className="h-[60px] w-[60px] max-sm:h-[50px] max-sm:w-[50px]">
            <Image alt="" height={60} src="/404.png" width={60} />
          </figure>
          <h1 className="text-title-2 max-sm:text-title-3 font-extrabold">
            500 Error
          </h1>
        </div>
        <div className="max-sm:text-body-3">
          <p>Internal Server Error :(</p>
          <p>Sorry, something went wrong on our side.</p>
          <p>Please try again later.</p>
        </div>
      </div>
      <Button className="h-[48px] w-[186px] whitespace-pre font-semibold max-sm:w-full">
        <Link href="/">메인 페이지로 이동하기</Link>
      </Button>
    </div>
  );
}
