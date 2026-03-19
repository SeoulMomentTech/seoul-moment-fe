import { useNavigate, useParams } from "react-router";

import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@shared/components/page-header";
import { PATH } from "@shared/constants/route";
import type { PatchAdminPromotionRequest } from "@shared/services/promotion";

import { Button } from "@seoul-moment/ui";

import { PromotionForm } from "./components/PromotionForm";
import { useAdminPromotionDetailQuery, useUpdateAdminPromotionMutation } from "./hooks";

export default function PromotionEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const promotionId = Number(id);
  const { data: response, isLoading } = useAdminPromotionDetailQuery(promotionId, {
    enabled: !Number.isNaN(promotionId) && promotionId > 0,
  });

  const { mutateAsync: updatePromotion, isPending } = useUpdateAdminPromotionMutation();

  const handleSubmit = async (data: PatchAdminPromotionRequest) => {
    try {
      await updatePromotion({ id: promotionId, data });
      alert("프로모션이 수정되었습니다.");
      navigate(PATH.PROMOTION);
    } catch (error) {
      console.error(error);
      alert("프로모션 수정에 실패했습니다.");
    }
  };

  if (isLoading) {
    return <div className="p-8 pt-24 text-center">로딩 중...</div>;
  }

  const defaultValues = response?.data;

  return (
    <div className="mx-auto max-w-5xl p-8 pt-24">
      <Button
        className="-ml-2 mb-6"
        onClick={() => navigate(PATH.PROMOTION)}
        variant="ghost"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        목록으로 돌아가기
      </Button>
      <PageHeader
        description="프로모션 정보를 수정합니다."
        title="프로모션 수정"
      />
      <PromotionForm
        defaultValues={defaultValues}
        isSubmitting={isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
