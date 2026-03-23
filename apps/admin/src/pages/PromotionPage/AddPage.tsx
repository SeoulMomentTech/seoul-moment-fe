import { useNavigate } from "react-router";

import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@shared/components/page-header";
import { PATH } from "@shared/constants/route";
import type { PostAdminPromotionRequest } from "@shared/services/promotion";

import { Button } from "@seoul-moment/ui";

import { PromotionForm } from "./components/PromotionForm";
import { useCreateAdminPromotionMutation } from "./hooks";

export default function PromotionAddPage() {
  const navigate = useNavigate();
  const { mutateAsync: createPromotion, isPending } = useCreateAdminPromotionMutation();

  const handleSubmit = async (data: PostAdminPromotionRequest) => {
    try {
      await createPromotion(data);
      alert("프로모션이 등록되었습니다.");
      navigate(PATH.PROMOTION);
    } catch (error) {
      console.error(error);
      alert("프로모션 등록에 실패했습니다.");
    }
  };

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
        description="새로운 프로모션을 등록합니다."
        title="프로모션 등록"
      />
      <PromotionForm isSubmitting={isPending} mode="add" onSubmit={handleSubmit} />
    </div>
  );
}
