import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@shared/lib/style";

const styleMap = {
  desktop: "min-h-[416px] min-w-[1280px] px-[40px]",
  mobile: "max-sm:min-h-[429px] max-sm:px-[20px] max-sm:min-w-full",
};

export function Footer() {
  return (
    <footer
      className={cn(
        "flex flex-col",
        "w-full bg-black font-medium text-white",
        styleMap.desktop,
        styleMap.mobile,
      )}
    >
      <div className={cn("mx-auto w-full max-w-[1280px]")}>
        <div
          className={cn(
            "flex min-h-[228px] gap-[60px] py-[60px]",
            "max-sm:pt-[40px] max-sm:pb-[20px]",
          )}
        >
          <div
            className={cn(
              "flex gap-[60px]",
              "max-sm:flex-col max-sm:gap-[40px]",
            )}
          >
            <div
              className={cn(
                "flex w-[380px] flex-col gap-[30px]",
                "max-sm:w-auto max-sm:gap-[20px] max-sm:text-[14px]",
              )}
            >
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/policy">Policy</Link>
            </div>
            <div
              className={cn(
                "flex w-[380px] flex-col gap-[30px]",
                "max-sm:w-auto max-sm:gap-[24px]",
              )}
            >
              <p className="font-semibold max-sm:text-[14px]">
                고객센터 영업시간
              </p>
              <p className="max-sm:text-[13px]">월~금 09:00~18:00</p>
            </div>
          </div>
          <div className="flex h-fit flex-1 justify-end gap-[10px]">
            <Link
              className={cn(
                "flex items-center",
                "max-sm:h-[36px] max-sm:w-[36px]",
              )}
              href="/"
            >
              <Image alt="" height={50} src="/sns/thread.svg" width={50} />
            </Link>
            <Link
              className={cn(
                "flex items-center",
                "max-sm:h-[36px] max-sm:w-[36px]",
              )}
              href="/"
            >
              <Image alt="" height={50} src="/sns/insta.svg" width={50} />
            </Link>
          </div>
        </div>
        <div className={cn("flex flex-col py-[40px] text-white/80")}>
          <div className={cn("mb-[20px] font-semibold", "max-sm:text-[14px]")}>
            首爾映像有限公司(Seoul Moment Co., Ltd.)
          </div>
          <div
            className={cn(
              "mb-[20px] flex items-center text-[14px]",
              "max-sm:mb-[10px] max-sm:flex-col max-sm:items-start max-sm:gap-[10px] max-sm:text-[13px]",
            )}
          >
            <div className="flex">
              <span>統一編號: 00148871</span>
              <div className="mx-[10px] h-[8px] w-[1px] bg-white/45" />
              <span>CEO: Justin Park</span>
            </div>
            <div className="mx-[10px] h-[8px] w-[1px] bg-white/45 max-sm:hidden" />
            <span>地址: 台北市大安區忠孝東路四段231號10樓之2</span>
          </div>
          <div
            className={cn(
              "flex items-center text-[14px]",
              "max-sm:flex-col max-sm:items-start max-sm:gap-[10px] max-sm:text-[13px]",
            )}
          >
            <span>Email : seoulmomenttw@gmail.com</span>
            <div className="mx-[10px] h-[8px] w-[1px] bg-white/45 max-sm:hidden" />
            <span>Line Customer Service ID : seoulmoment</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
