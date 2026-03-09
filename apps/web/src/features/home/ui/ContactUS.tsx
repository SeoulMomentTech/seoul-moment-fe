import Image from "next/image";
import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";

import { Link } from "@/i18n/navigation";

import { Button } from "@seoul-moment/ui";

export function ContactUS() {
  const t = useTranslations();

  return (
    <section
      className={cn(
        "w-7xl flex h-[600px] pb-[92px] pt-[108px]",
        "items-center justify-between",
        "max-sm:h-[537px] max-sm:w-auto max-sm:bg-black max-sm:px-5 max-sm:text-white",
        "max-sm:flex-col-reverse max-sm:gap-10 max-sm:px-5 max-sm:py-[50px]",
      )}
    >
      <div className={cn("flex flex-col gap-10", "max-sm:w-full")}>
        <div className="flex flex-col gap-5">
          <h2 className={cn("text-title-2 font-bold", "max-sm:text-title-3")}>
            Contact Us
          </h2>
          <p>{t("free_to_contact")}</p>
        </div>
        <Link href="/contact">
          <Button
            className={cn(
              "h-12 w-fit px-5 py-4 font-semibold",
              "max-sm:bg-white max-sm:text-black",
            )}
          >
            {t("view")}
          </Button>
        </Link>
      </div>
      <div
        className={cn(
          "h-[400px] w-[627px] bg-slate-300",
          "max-sm:h-[220px] max-sm:w-full",
        )}
      >
        <Image
          alt=""
          className="h-full w-full"
          height={400}
          src="/contact-us.webp"
          width={627}
        />
      </div>
    </section>
  );
}
