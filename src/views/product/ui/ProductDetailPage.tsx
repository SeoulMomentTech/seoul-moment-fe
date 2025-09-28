import { StarIcon } from "lucide-react";
import { BrandProductList } from "@/features/product";
import { cn } from "@/shared/lib/style";
import { Button } from "@/shared/ui/button";
import { AvatarBadge } from "@/widgets/avatar-badge/ui/AvatarBadge";
import { LikeCount } from "@/widgets/like-count/ui/LikeCount";
import { ProductGallery } from "@/widgets/product-gallery";

export default function ProductDetailPage() {
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
          <ProductGallery />
          <div className="w-full max-sm:px-[20px]">
            <h2
              className={cn(
                "text-title-4 mb-[20px] font-bold",
                "max-sm:text-body-2",
              )}
            >
              맨체스터 유나이티드 24/25 어웨이 저지
            </h2>
            <div className="flex items-center justify-between py-[10px]">
              <AvatarBadge
                avatarUrl="https://image-dev.seoulmoment.com.tw/news/6be9d45c-0a31-428d-8d80-00084c09f301.frro-k080eixous1aa55xahae8"
                name="아디다스"
              />
              <LikeCount
                count={200}
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
                <div className="flex">
                  <StarIcon
                    className="text-transparent"
                    fill="#F37B2A"
                    height={16}
                    strokeWidth={1}
                    width={16}
                  />
                  <StarIcon
                    className="text-transparent"
                    fill="#F37B2A"
                    height={16}
                    strokeWidth={1}
                    width={16}
                  />
                  <StarIcon
                    className="text-transparent"
                    fill="#F37B2A"
                    height={16}
                    strokeWidth={1}
                    width={16}
                  />
                  <StarIcon
                    className="text-transparent"
                    fill="#F37B2A"
                    height={16}
                    strokeWidth={1}
                    width={16}
                  />
                  <StarIcon
                    className="text-transparent"
                    fill="#F37B2A"
                    height={16}
                    strokeWidth={1}
                    width={16}
                  />
                </div>
                <span className="text-body-3 max-sm:text-body-4">리뷰 422</span>
              </div>
              {/** 가격 영역*/}
              <div className="flex flex-col gap-[20px]">
                <div className={cn("text-body-3 flex", "text-body-4")}>
                  <span className="min-w-[120px]">정상가</span>
                  <span className="text-black/40 line-through">83,300원</span>
                </div>
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
                    83,300원
                  </span>
                </div>
              </div>
            </div>
            {/** 원산지, 배송 정보 */}
            <div
              className={cn(
                "flex flex-col gap-[20px] pt-[20px] pb-[30px]",
                "max-sm:gap-[16px] max-sm:pb-[16px]",
              )}
            >
              <div className={cn("text-body-3 flex", "text-body-4")}>
                <span className="min-w-[120px]">원산지</span>
                <span>블라블라</span>
              </div>
              <div className={cn("text-body-3 flex", "text-body-4")}>
                <span className="min-w-[120px]">배송정보</span>
                <span>00일 이내 출고</span>
              </div>
              <div className={cn("text-body-3 flex", "text-body-4")}>
                <span className="min-w-[120px]">배송비</span>
                <span>3,300원</span>
              </div>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "px-[20px] pt-[50px] pb-[76px] max-sm:pt-[40px] max-sm:pb-[40px]",
          )}
        >
          <h3
            className={cn(
              "text-title-3 mb-[30px] font-semibold",
              "max-sm:text-body-1",
            )}
          >
            동일 브랜드 다른 상품
          </h3>
          <BrandProductList />
        </div>

        <div className="relative h-[800px]">
          <div className="h-full bg-gray-300" />
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
              )}
              size="lg"
              variant="outline"
            >
              상품 상세 보기
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
