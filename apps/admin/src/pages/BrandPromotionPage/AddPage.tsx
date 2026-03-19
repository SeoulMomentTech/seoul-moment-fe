import { useNavigate } from "react-router";

import { PATH } from "@shared/constants/route";
import type { PostAdminBrandPromotionRequest } from "@shared/services/brandPromotion";
import { toast } from "sonner";

import { BrandPromotionForm } from "./components";
import { useCreateBrandPromotionMutation, useBrandPromotionForm } from "./hooks";


export function BrandPromotionAddPage() {
  const navigate = useNavigate();
  const form = useBrandPromotionForm();
  const { mutateAsync: createPromotion, isPending } =
    useCreateBrandPromotionMutation();

  const handleSubmit = async (data: PostAdminBrandPromotionRequest) => {
    try {
      await createPromotion(data);
      toast.success("이벤트가 성공적으로 등록되었습니다.");
      navigate(PATH.BRAND_PROMOTION);
    } catch (error) {
      console.error(error);
      toast.error("이벤트 등록에 실패했습니다.");
    }
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
