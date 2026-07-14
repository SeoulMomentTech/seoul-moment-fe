"use client";

import { useState } from "react";

import { StarIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { useAppQuery, useLanguage } from "@shared/lib/hooks";
import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import { cn } from "@shared/lib/style";
import { setComma, toNTCurrency } from "@shared/lib/utils";
import {
  getProductDetail,
  type GetProductDetailRes,
} from "@shared/services/product";
import { AvatarBadge } from "@widgets/avatar-badge/ui/AvatarBadge";
import { LikeCount } from "@widgets/like-count/ui/LikeCount";

import { Link } from "@/i18n/navigation";

import { useProductLikeToggle, useTrackRecentProduct } from "@entities/product";
import { BrandProductList, ProductExternalGroup } from "@features/product";
import { Button } from "@seoul-moment/ui";
import type { CommonRes } from "@shared/services";
import { ProductDetailImage } from "@widgets/product-detail-image";
import { ProductGallery } from "@widgets/product-gallery";

interface ProductDetailPageProps {
  id: number;
  initialData: CommonRes<GetProductDetailRes>;
}

export default function ProductDetailPage({
  id,
  initialData,
}: ProductDetailPageProps) {
  const languageCode = useLanguage();
  const { isAuthenticated } = useUserAuthStore();
  const { data } = useAppQuery({
    queryKey: ["product-detail", id, languageCode],
    queryFn: () => getProductDetail({ id, languageCode }),
    select: (res) => res.data,
    initialData,
    // SSR fetch는 accessToken 없이 호출되어 isLiked가 false다.
    // stale 마킹 + 인증된 경우에만 재조회해 개인화 값(isLiked)을 정확히 채운다.
    initialDataUpdatedAt: 0,
    enabled: !!id && isAuthenticated,
    throwOnError: true,
  });

  const t = useTranslations();
  const [showMore, setShowMore] = useState(false);

  const { liked, count, handleToggleLike } = useProductLikeToggle({
    productId: id,
    isLiked: data?.isLiked ?? false,
    likeCount: data?.like ?? 0,
  });

  useTrackRecentProduct({ productId: id });

  const handleToggleShowMore = (showMore: boolean) => {
    setShowMore(showMore);
  };

  if (!data) return null;

  return (
    <div
      className={cn(
        "px-[20px] pb-[100px] pt-[106px]",
        "max-sm:px-0 max-sm:pb-0 max-sm:pt-[56px]",
      )}
    >
      <section className={cn("mx-auto w-[1200px]", "max-sm:w-full")}>
        <div
          className={cn(
            "flex gap-[80px] border-b border-b-black/10 pb-[50px]",
            "max-sm:flex-col max-sm:gap-[30px] max-sm:border-b-transparent max-sm:pb-0",
          )}
        >
          <ProductGallery images={data.subImage} productName={data.name} />
          <div className="w-full max-sm:px-[20px]">
            <h2
              className={cn(
                "text-title-4 mb-[20px] font-bold",
                "max-sm:text-body-2",
              )}
            >
              {data.name}
            </h2>
            <div className="flex items-center justify-between py-[10px]">
              <Link href={`/product?brandId=${data.brand.id}`}>
                <AvatarBadge
                  avatarUrl={data.brand.profileImg}
                  name={data.brand.name}
                />
              </Link>
              <LikeCount
                active={liked}
                count={count}
                countClassName="max-sm:hidden"
                iconSize={20}
                onClick={handleToggleLike}
              />
            </div>
            <div
              className={cn(
                "flex flex-col gap-[30px] border-b border-b-black/10 pb-[20px] pt-[10px]",
                "max-sm:gap-[20px]",
              )}
            >
              <div className="flex gap-[4px]">
                <div className="flex items-center">
                  <StarIcon
                    className="text-transparent"
                    fill="var(--color-brand)"
                    height={16}
                    strokeWidth={1}
                    width={16}
                  />
                  <span className="text-body-3 max-sm:text-body-4">
                    ({data.reviewAverage})
                  </span>
                </div>
                <span className="text-body-3 max-sm:text-body-4">
                  {t("review")} {setComma(data.review)}
                </span>
              </div>
              {/** 가격 영역*/}
              <div className="flex flex-col gap-[20px]">
                {data.price > 0 && (
                  <div className={cn("text-body-3 flex", "text-body-4")}>
                    <span className="min-w-[120px]">{t("price")}</span>
                    <span
                      className={cn(
                        "text-black",
                        data.discountPrice > 0 && "text-black/40 line-through",
                      )}
                    >
                      {toNTCurrency(data.price)}
                    </span>
                  </div>
                )}
                {data.discountPrice > 0 && (
                  <div className="flex items-center">
                    <span
                      className={cn(
                        "text-body-3 min-w-[120px]",
                        "max-sm:text-body-4",
                      )}
                    >
                      판매가
                    </span>
                    <span
                      className={cn(
                        "text-body-1 font-semibold",
                        "max-sm:text-body-2",
                      )}
                    >
                      {toNTCurrency(data.discountPrice)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/** 원산지, 배송 정보 */}
            <div
              className={cn(
                "flex flex-col gap-[20px] pb-[50px] pt-[20px]",
                "max-sm:gap-[16px] max-sm:pb-[16px]",
              )}
            >
              {data.origin && (
                <div className={cn("text-body-3 flex", "text-body-4")}>
                  <span className="min-w-[130px]">{t("place_of_origin")}</span>
                  <span>{data.origin}</span>
                </div>
              )}
              {data.shippingInfo > 0 && (
                <div className={cn("text-body-3 flex", "text-body-4")}>
                  <span className="min-w-[130px]">
                    {t("shipping_information")}
                  </span>
                  <span>{t("within_days", { n: data.shippingInfo })}</span>
                </div>
              )}
              {data.shippingCost > 0 && (
                <div className={cn("text-body-3 flex", "text-body-4")}>
                  <span className="min-w-[130px]">{t("shipping_fee")}</span>
                  <span>{toNTCurrency(data.shippingCost)}</span>
                </div>
              )}
              {/* 색상 정보 */}
              {data.option?.COLOR?.length > 0 && (
                <div className={cn("text-body-3 flex", "text-body-4")}>
                  <span className="min-w-[130px]">{t("color")}</span>
                  <span>{data.option.COLOR[0].value}</span>
                </div>
              )}
              {/* 사이즈 */}
              {data.option?.SIZE?.length > 0 && (
                <div className={cn("text-body-3 flex", "text-body-4")}>
                  <span className="min-w-[130px]">{t("size")}</span>
                  <span>
                    {data.option.SIZE.map((item) => item.value).join("/")}
                  </span>
                </div>
              )}
            </div>
            <ProductExternalGroup items={data.external} />
          </div>
        </div>
        <BrandProductList data={data.relate} />
        <ProductDetailImage imageSrc={data.detailImg} showMore={showMore}>
          <div
            className={cn(
              "flex items-center justify-center",
              "absolute bottom-0 left-0 w-full py-[20px]",
            )}
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, var(--color-brand-foreground) 100%)",
            }}
          >
            <Button
              className={cn(
                "border-black/20 bg-transparent",
                "text-body-2 max-sm:mx-[20px] max-sm:w-full",
                showMore && "hidden",
              )}
              onClick={() => handleToggleShowMore(!showMore)}
              size="lg"
              variant="outline"
            >
              {t("view_product_details")}
            </Button>
          </div>
        </ProductDetailImage>
      </section>
    </div>
  );
}
