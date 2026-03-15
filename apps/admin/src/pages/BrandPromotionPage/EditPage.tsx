import { useParams } from "react-router";

import { BrandPromotionForm } from "./components";
import { useBrandPromotionDetailQuery } from "./hooks";

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

  return (
    <BrandPromotionForm
      description="등록된 브랜드 프로모션을 상세 확인 및 수정할 수 있습니다."
      initialValues={{
        brandId: detailResponse.data.brandDto.id,
        descriptions: {
          ko:
            detailResponse.data.brandDto.language.find(
              (item) => item.languageCode === "ko",
            )?.description ?? "",
          en:
            detailResponse.data.brandDto.language.find(
              (item) => item.languageCode === "en",
            )?.description ?? "",
          zh:
            detailResponse.data.brandDto.language.find(
              (item) => item.languageCode === "zh-TW",
            )?.description ?? "",
        },
        isActive: detailResponse.data.isActive,
      }}
      submitLabel="수정"
      title="브랜드 프로모션 수정"
    />
  );
}
