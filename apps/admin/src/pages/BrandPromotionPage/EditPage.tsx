import { useParams } from "react-router";

import type { GetAdminBrandPromotionDetailResponse } from "@shared/services/brandPromotion";

import { BrandPromotionForm } from "./components";
import { useBrandPromotionDetailQuery } from "./hooks";
import { useBrandPromotionForm } from "./hooks/useBrandPromotionForm";
import { getLanguageCode } from "./utils/form";

export function BrandPromotionEditPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: detailResponse,
    isLoading,
    isError,
  } = useBrandPromotionDetailQuery(Number(id));

  if (isLoading) {
    return (
      <div className="p-8 pt-24 text-center text-gray-500">
        데이터를 불러오는 중입니다...
      </div>
    );
  }

  if (isError || !detailResponse?.data) {
    return (
      <div className="p-8 pt-24 text-center text-red-500">
        데이터를 불러오는데 실패했습니다.
      </div>
    );
  }

  return <BrandPromotionEditContent detail={detailResponse.data} />;
}

function BrandPromotionEditContent({
  detail,
}: {
  detail: GetAdminBrandPromotionDetailResponse;
}) {
  const form = useBrandPromotionForm({
    initialState: {
      banners:
        detail.bannerList.length > 0
          ? detail.bannerList.map((banner) => {
            const titles = { ko: "", en: "", zh: "" };
            banner.language.forEach((item) => {
              titles[getLanguageCode(item.languageCode)] = item.title;
            });

            return {
              imagePath: banner.imageUrl,
              linkUrl: banner.linkUrl,
              mobileImagePath: banner.mobileImageUrl,
              titles,
            };
          })
          : [],
      events:
        detail?.eventAndCouponList?.length ?? 0 > 0
          ? detail.eventAndCouponList?.map((eventItem) => {
            const titles = { ko: "", en: "", zh: "" };
            eventItem.event.language.forEach((item) => {
              titles[getLanguageCode(item.languageCode)] = item.title;
            });

            return {
              coupons: eventItem.coupon.map((coupon) => {
                const content = {
                  ko: { title: "", description: "" },
                  en: { title: "", description: "" },
                  zh: { title: "", description: "" },
                };

                coupon.language.forEach((item) => {
                  const code = getLanguageCode(item.languageCode);
                  content[code] = {
                    description: item.description,
                    title: item.title,
                  };
                });

                return {
                  content,
                  imagePath: coupon.imageUrl,
                };
              }),
              status: eventItem.event.status,
              titles,
            };
          })
          : [],
      popups:
        detail.popupList.length > 0
          ? detail.popupList.map((popup) => {
            const content = {
              ko: { title: "", description: "" },
              en: { title: "", description: "" },
              zh: { title: "", description: "" },
            };

            popup.language.forEach((item) => {
              const code = getLanguageCode(item.languageCode);
              content[code] = {
                description: item.description,
                title: item.title,
              };
            });

            return {
              address: popup.address,
              content,
              endDate: popup.endDate ?? "",
              endTime: popup.endTime,
              imagePathList: popup.imageUrlList,
              isActive: popup.isActive,
              latitude: popup.latitude,
              longitude: popup.longitude,
              place: popup.place,
              startDate: popup.startDate,
              startTime: popup.startTime,
            };
          })
          : [],
      sections:
        detail.sectionList.length > 0
          ? detail.sectionList.map((section) => ({
            imagePathList: section.imageUrlList,
            type: section.type,
          }))
          : [],
      values: {
        brandId: detail.brandDto.id,
        descriptions: {
          ko:
            detail.brandDto.language.find((item) => item.languageCode === "ko")
              ?.description ?? "",
          en:
            detail.brandDto.language.find((item) => item.languageCode === "en")
              ?.description ?? "",
          zh:
            detail.brandDto.language.find(
              (item) => item.languageCode === "zh-TW",
            )?.description ?? "",
        },
        isActive: detail.isActive,
      },
    },
  });

  console.log(detail)

  return (
    <BrandPromotionForm
      description="등록된 브랜드 프로모션을 상세 확인 및 수정할 수 있습니다."
      form={form}
      submitLabel="수정"
      title="브랜드 프로모션 수정"
    />
  );
}
