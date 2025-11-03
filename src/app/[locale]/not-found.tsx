import Image from "next/image";
import { Button } from "@shared/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-[60px] pt-[156px] max-sm:px-[20px] max-sm:pt-[136px]">
      <div className="flex flex-col items-center gap-[30px] text-center">
        <div className="flex flex-col items-center gap-[12px]">
          <figure className="h-[60px] w-[60px] max-sm:h-[50px] max-sm:w-[50px]">
            <Image alt="" height={60} src="/404.png" width={60} />
          </figure>
          <h1 className="text-title-2 max-sm:text-title-3 font-semibold">
            404 Error
          </h1>
        </div>
        <div className="max-sm:text-body-3">
          <p>The requested page could not be found :(</p>
          <p>Please check the URL and try again.</p>
        </div>
      </div>
      <Button className="h-[48px] w-[186px] font-semibold whitespace-pre max-sm:w-full">
        메인 페이지로 이동하기
      </Button>
    </div>
  );
}
