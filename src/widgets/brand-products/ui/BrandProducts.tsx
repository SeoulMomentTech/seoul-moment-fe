import Link from "next/link";
import { BrandProductCard } from "@/entities/brand";
import { SectionWithLabel } from "@/widgets/section-with-label";

export default function BrandProducts() {
  return (
    <SectionWithLabel
      className="mx-auto w-[1280px] py-[100px] max-sm:w-full max-sm:px-[20px] max-sm:py-[50px]"
      label={
        <div className="mb-[30px] flex w-full items-end justify-between max-sm:mb-[20px]">
          <h3 className="text-[32px] max-sm:text-[20px]">
            <b>Brand Products</b>
          </h3>
          <Link
            className="text-[14px] hover:underline max-sm:text-[13px]"
            href="/"
          >
            More
          </Link>
        </div>
      }
    >
      <div className="flex gap-[20px] max-sm:gap-[16px] max-sm:overflow-x-auto max-sm:overflow-y-hidden">
        <BrandProductCard />
        <BrandProductCard />
        <BrandProductCard />
        <BrandProductCard />
      </div>
    </SectionWithLabel>
  );
}
