import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export function SeasonCollection() {
  return (
    <section className="flex justify-between gap-[220px] py-[140px]">
      <div className="ml-auto flex flex-col justify-center gap-[90px] pl-[20px]">
        <div className="flex flex-col gap-[20px]">
          <h3 className="text-[36px] font-semibold">2025 S/S Vibes of Seoul</h3>
          <span>새로운 2025 S/S 상품으로 실용적인 제품을 만나보세요.</span>
        </div>
        <Link className="flex items-center text-[14px]" href="/product">
          <div className="inline-flex gap-[4px] border-b">
            Product detail
            <ArrowRightIcon height={16} width={16} />
          </div>
        </Link>
      </div>
      <div className="flex w-[930px] gap-[60px]">
        <div className="h-[590px] w-[435px] bg-gray-300" />
        <div className="h-[590px] w-[435px] bg-gray-300" />
      </div>
    </section>
  );
}
