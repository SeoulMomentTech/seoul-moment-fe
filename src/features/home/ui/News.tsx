import Link from "next/link";
import { cn } from "@/shared/lib/style";
import { SectionWithLabel } from "@/widgets/section-with-label";

export function News() {
  return (
    <SectionWithLabel
      className={cn("py-[100px]", "max-sm:py-[50px]")}
      label={
        <div
          className={cn(
            "mb-[30px] flex w-full items-end justify-between",
            "max-sm:mb-[20px] max-sm:px-[20px]",
          )}
        >
          <h3 className="text-[32px] max-sm:text-[20px]">
            <b>NEWS</b>
          </h3>
          <Link className="text-[14px] hover:underline" href="/">
            More
          </Link>
        </div>
      }
    >
      <div
        className={cn(
          "flex justify-between gap-[60px]",
          "max-sm:w-full max-sm:flex-col",
        )}
      >
        <div
          className={cn(
            "flex h-[596px] w-[460px] flex-col bg-gray-400",
            "max-sm:h-[457px] max-sm:w-full",
          )}
        />
        <div className="max-sm:flex max-sm:w-full max-sm:justify-end max-sm:px-[20px]">
          <div
            className={cn(
              "flex h-[596px] w-[370px] flex-col bg-gray-400",
              "max-sm:h-[435px] max-sm:w-[264px]",
            )}
          />
        </div>
        <div className="max-sm:px-[20px]">
          <div
            className={cn(
              "flex h-[596px] w-[370px] flex-col bg-gray-400",
              "max-sm:h-[433px] max-sm:w-[210px]",
            )}
          />
        </div>
      </div>
    </SectionWithLabel>
  );
}
