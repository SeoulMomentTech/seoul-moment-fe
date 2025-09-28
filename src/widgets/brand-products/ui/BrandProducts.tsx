"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { BrandProductCard } from "@/entities/brand";
import useLanguage from "@/shared/lib/hooks/useLanguage";
import { getProductList } from "@/shared/services/product";
import { SectionWithLabel } from "@/widgets/section-with-label";

interface BrandProductsProps {
  id: number;
}

export default function BrandProducts({ id }: BrandProductsProps) {
  const languageCode = useLanguage();
  const { data } = useQuery({
    queryKey: ["brand-products", id],
    queryFn: () =>
      getProductList({ brandId: id, page: 1, count: 4, languageCode }),
    select: (res) => res.data.list,
  });

  if (!data) return null;

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
      <div className="max-sm:scrollbar-hide flex gap-[20px] max-sm:gap-[16px] max-sm:overflow-x-auto max-sm:overflow-y-hidden">
        {data.map((product) => (
          <BrandProductCard key={product.id} {...product} />
        ))}
      </div>
    </SectionWithLabel>
  );
}
