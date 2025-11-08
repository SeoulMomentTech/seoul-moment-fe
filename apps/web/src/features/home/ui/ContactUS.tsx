import { Button } from "@seoul-moment/ui";
import { Link } from "@/i18n/navigation";
import { cn } from "@shared/lib/style";

export function ContactUS() {
  return (
    <section
      className={cn(
        "flex h-[600px] w-[1280px] pb-[92px] pt-[108px]",
        "items-center justify-between",
        "max-sm:h-[537px] max-sm:w-auto max-sm:bg-black max-sm:px-[20px] max-sm:text-white",
        "max-sm:flex-col-reverse max-sm:gap-[40px] max-sm:px-[20px] max-sm:py-[50px]",
      )}
    >
      <div className={cn("flex flex-col gap-[40px]", "max-sm:w-full")}>
        <div className="flex flex-col gap-[20px]">
          <h2 className={cn("text-[32px] font-bold", "max-sm:text-[24px]")}>
            Contact Us
          </h2>
          <p>
            문의사항이 필요하신 경우
            <br className="hidden max-sm:block" /> 언제든지 연락해주시기
            바랍니다.
          </p>
        </div>
        <Link href="/contact">
          <Button
            className={cn(
              "h-[48px] w-fit px-[20px] py-[16px] font-semibold",
              "max-sm:bg-white max-sm:text-black",
            )}
          >
            바로가기
          </Button>
        </Link>
      </div>
      <div
        className={cn(
          "h-[400px] w-[627px] bg-slate-300",
          "max-sm:h-[220px] max-sm:w-full",
        )}
      />
    </section>
  );
}
