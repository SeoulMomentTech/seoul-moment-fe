"use client";

import { useQuery } from "@tanstack/react-query";
import { StarIcon } from "lucide-react";
import { useState } from "react";
import { BrandProductList } from "@/features/product";
import useLanguage from "@/shared/lib/hooks/useLanguage";
import { cn } from "@/shared/lib/style";
import { setComma } from "@/shared/lib/utils";
import { getProductDetail } from "@/shared/services/product";
import { Button } from "@/shared/ui/button";
import { AvatarBadge } from "@/widgets/avatar-badge/ui/AvatarBadge";
import { LikeCount } from "@/widgets/like-count/ui/LikeCount";
import { ProductDetailImage } from "@/widgets/product-detail-image";
import { ProductGallery } from "@/widgets/product-gallery";

interface ProductDetailPageProps {
  id: number;
}

export default function ProductDetailPage({ id }: ProductDetailPageProps) {
  const languageCode = useLanguage();
  const { data } = useQuery({
    queryKey: ["product-detail", id, languageCode],
    queryFn: () => getProductDetail({ id, languageCode }),
    select: (res) => res.data,
  });

  const [showMore, setShowMore] = useState(false);

  const handleToggleShowMore = (showMore: boolean) => {
    setShowMore(showMore);
  };

  if (!data) return null;

  return (
    <div
      className={cn(
        "px-[20px] pt-[106px] pb-[100px]",
        "max-sm:px-0 max-sm:pt-[56px] max-sm:pb-0",
      )}
    >
      <section className={cn("mx-auto w-[1280px]", "max-sm:w-full")}>
        <div
          className={cn(
            "flex gap-[80px] border-b border-b-black/10 pb-[50px]",
            "max-sm:flex-col max-sm:gap-[30px] max-sm:border-b-transparent max-sm:pb-0",
          )}
        >
          <ProductGallery images={data.subImage} />
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
              <AvatarBadge
                avatarUrl={data.brand.profileImage}
                name={data.brand.name}
              />
              <LikeCount
                count={data.like}
                countClassName="max-sm:hidden"
                iconSize={20}
              />
            </div>
            <div
              className={cn(
                "flex flex-col gap-[30px] border-b border-b-black/10 pt-[10px] pb-[20px]",
                "max-sm:gap-[20px]",
              )}
            >
              <div className="flex gap-[4px]">
                <div className="flex items-center">
                  <StarIcon
                    className="text-transparent"
                    fill="#F37B2A"
                    height={16}
                    strokeWidth={1}
                    width={16}
                  />
                  <span className="text-body-3 max-sm:text-body-4">
                    ({data.reviewAverage})
                  </span>
                </div>
                <span className="text-body-3 max-sm:text-body-4">
                  리뷰 {setComma(data.review)}
                </span>
              </div>
              {/** 가격 영역*/}
              <div className="flex flex-col gap-[20px]">
                {data.price && (
                  <div className={cn("text-body-3 flex", "text-body-4")}>
                    <span className="min-w-[120px]">정상가</span>
                    <span className="text-black/40 line-through">
                      {setComma(data.price)}
                    </span>
                  </div>
                )}
                {data.discountPrice && (
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
                      {setComma(data.discountPrice)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/** 원산지, 배송 정보 */}
            <div
              className={cn(
                "flex flex-col gap-[20px] pt-[20px] pb-[30px]",
                "max-sm:gap-[16px] max-sm:pb-[16px]",
              )}
            >
              {data.origin && (
                <div className={cn("text-body-3 flex", "text-body-4")}>
                  <span className="min-w-[120px]">원산지</span>
                  <span>{data.origin}</span>
                </div>
              )}
              {data.shippingInfo && (
                <div className={cn("text-body-3 flex", "text-body-4")}>
                  <span className="min-w-[120px]">배송정보</span>
                  <span>{data.shippingInfo}일 이내 출고</span>
                </div>
              )}
              {data.shippingCost && (
                <div className={cn("text-body-3 flex", "text-body-4")}>
                  <span className="min-w-[120px]">배송비</span>
                  <span>{setComma(data.shippingCost)}</span>
                </div>
              )}
            </div>
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
                "linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #FFF 100%)",
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
              상품 상세 보기
            </Button>
          </div>
        </ProductDetailImage>
      </section>
    </div>
  );
}
