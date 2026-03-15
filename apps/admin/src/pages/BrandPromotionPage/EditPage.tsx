import { useParams } from "react-router";

import type { GetAdminBrandPromotionDetailResponse } from "@shared/services/brandPromotion";

import { BrandPromotionForm } from "./components";
import { useBrandPromotionDetailQuery, } from "./hooks";
import { useBrandPromotionForm } from "./hooks/useBrandPromotionForm";

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
    initialValues: {
      brandId: detail.brandDto.id,
      descriptions: {
        ko:
          detail.brandDto.language.find((item) => item.languageCode === "ko")
            ?.description ?? "",
        en:
          detail.brandDto.language.find((item) => item.languageCode === "en")
            ?.description ?? "",
        zh:
          detail.brandDto.language.find((item) => item.languageCode === "zh-TW")
            ?.description ?? "",
      },
      isActive: detail.isActive,
    },
  });

  return (
    <BrandPromotionForm
      description="등록된 브랜드 프로모션을 상세 확인 및 수정할 수 있습니다."
      form={form}
      submitLabel="수정"
      title="브랜드 프로모션 수정"
    />
  );
}
