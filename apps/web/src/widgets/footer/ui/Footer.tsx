import Image from "next/image";
import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";

import { Link } from "@/i18n/navigation";

const styleMap = {
  desktop: "min-h-[416px] min-w-[1280px] px-[40px]",
  mobile: "max-sm:min-h-[429px] max-sm:px-[20px] max-sm:min-w-full",
};

export function Footer() {
  const t = useTranslations();

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
            "max-sm:pb-[20px] max-sm:pt-[40px]",
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
                "max-sm:text-body-3 max-sm:w-auto max-sm:gap-[20px]",
              )}
            >
              <Link href="/about">{t("about")}</Link>
              <Link href="/contact">{t("contact")}</Link>
              <Link href="/policy">{t("policy")}</Link>
            </div>
            <div
              className={cn(
                "flex w-[380px] flex-col gap-[30px]",
                "max-sm:w-auto max-sm:gap-[24px]",
              )}
            >
              <p className="max-sm:text-body-3 font-semibold">
                {t("customer_service")}
              </p>
              <p className="max-sm:text-body-4">
                {t("mon_to_fri")} 09:00~18:00
              </p>
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
          <div className={cn("mb-[20px] font-semibold", "max-sm:text-body-3")}>
            {t("seoulmoment")}
          </div>
          <div
            className={cn(
              "text-body-3 mb-[20px] flex items-center",
              "max-sm:text-body-4 max-sm:mb-[10px] max-sm:flex-col max-sm:items-start max-sm:gap-[10px]",
            )}
          >
            <div className="flex">
              <span>{t("business_license_number")}: 00148871</span>
              <div className="mx-[10px] h-[8px] w-px bg-white/45" />
              <span>{t("ceo-info")}</span>
            </div>
            <div className="mx-[10px] h-[8px] w-px bg-white/45 max-sm:hidden" />
            <span>{t("address")}</span>
          </div>
          <div
            className={cn(
              "text-body-3 flex items-center",
              "max-sm:text-body-4 max-sm:flex-col max-sm:items-start max-sm:gap-[10px]",
            )}
          >
            <span>Email: seoulmomentkr@gmail.com</span>
            <div className="mx-[10px] h-[8px] w-px bg-white/45 max-sm:hidden" />
            <span>Line Customer Service ID : seoulmoment</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
