import { useNavigate, useParams } from "react-router";

import { PATH } from "@shared/constants/route";
import type {
  GetAdminBrandPromotionDetailResponse,
  PatchAdminBrandPromotionRequest,
} from "@shared/services/brandPromotion";
import { notification } from "@shared/utils/notification";

import { BrandPromotionForm } from "./components";
import {
  useBrandPromotionDetailQuery,
  useBrandPromotionForm,
  useUpdateBrandPromotionMutation,
} from "./hooks";
import { getBrandPromotionInitialState } from "./utils/form";

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
    <BrandPromotionEditContent
      detail={detailResponse.data}
      id={Number(id)}
    />
  );
}

interface BrandPromotionEditContentProps {
  id: number;
  detail: GetAdminBrandPromotionDetailResponse;
}

function BrandPromotionEditContent({
  id,
  detail,
}: BrandPromotionEditContentProps) {
  const navigate = useNavigate();
  const form = useBrandPromotionForm({
    initialState: getBrandPromotionInitialState(detail),
  });
  const { mutate: updatePromotion, isPending } =
    useUpdateBrandPromotionMutation();

  const handleSubmit = (payload: PatchAdminBrandPromotionRequest) => {
    updatePromotion(
      { id, payload },
      {
        onSuccess: () => {
          notification.success("브랜드 프로모션이 성공적으로 수정되었습니다.");
          navigate(PATH.BRAND_PROMOTION);
        },
      },
    );
  };

  return (
    <BrandPromotionForm
      description="등록된 브랜드 프로모션을 상세 확인 및 수정할 수 있습니다."
      form={form}
      isLoading={isPending}
      onSubmit={(payload) =>
        handleSubmit(payload as PatchAdminBrandPromotionRequest)
      }
      payloadMode="patch"
      submitLabel="수정"
      title="브랜드 프로모션 수정"
    />
  );
}
