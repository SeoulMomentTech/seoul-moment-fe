import { useNavigate } from "react-router";

import { PATH } from "@shared/constants/route";
import type { PostAdminBrandPromotionRequest } from "@shared/services/brandPromotion";
import { notification } from "@shared/utils/notification";

import { BrandPromotionForm } from "./components";
import { useCreateBrandPromotionMutation, useBrandPromotionForm } from "./hooks";


export function BrandPromotionAddPage() {
  const navigate = useNavigate();
  const form = useBrandPromotionForm();
  const { mutate: createPromotion, isPending } =
    useCreateBrandPromotionMutation();

  const handleSubmit = (data: PostAdminBrandPromotionRequest) => {
    createPromotion(data, {
      onSuccess: () => {
        notification.success("브랜드 프로모션이 성공적으로 등록되었습니다.");
        navigate(PATH.BRAND_PROMOTION);
      },
    });
  };

  return (
    <BrandPromotionForm
      description="새로운 브랜드 프로모션을 등록합니다."
      form={form}
      isLoading={isPending}
      onSubmit={handleSubmit}
      submitLabel="등록"
      title="브랜드 프로모션 등록"
    />
  );
}
