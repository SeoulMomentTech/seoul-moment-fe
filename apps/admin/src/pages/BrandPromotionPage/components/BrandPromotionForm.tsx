import { useNavigate } from "react-router";

import { ArrowLeft } from "lucide-react";

import { useAdminBrandListQuery } from "@pages/BrandPage/ListPage/hooks";
import { PATH } from "@shared/constants/route";
import type { PostAdminBrandPromotionRequest } from "@shared/services/brandPromotion";

import { Button } from "@seoul-moment/ui";

import { BrandPromotionFormContent } from "./BrandPromotionFormContent";
import { TAB_ITEMS } from "../constants/form";
import type { BrandPromotionFormState } from "../hooks/useBrandPromotionForm";

interface BrandPromotionFormProps {
  title: string;
  description: string;
  submitLabel: string;
  form: BrandPromotionFormState;
  isLoading?: boolean;
  onSubmit?(payload: PostAdminBrandPromotionRequest): Promise<void> | void;
}

export function BrandPromotionForm({
  title,
  description,
  submitLabel,
  form,
  isLoading = false,
  onSubmit,
}: BrandPromotionFormProps) {
  const navigate = useNavigate();
  const { data: brandResponse, isLoading: isBrandLoading } =
    useAdminBrandListQuery({
      page: 1,
      count: 100,
      searchColumn: "name",
      sort: "DESC",
    });

  const brandOptions =
    brandResponse?.data.list.map((brand) => ({
      value: String(brand.id),
      label:
        brand.nameDto.find((item) => item.languageCode === "ko")?.name ??
        `ID ${brand.id}`,
    })) ?? [];

  const handleSubmit = () => {
    form.setIsSubmitAttempted(true);

    if (!form.isSubmitEnabled) {
      return;
    }

    const payload = form.createPayload();

    if (!onSubmit || !payload) {
      return;
    }

    onSubmit(payload);
  };

  return (
    <div className="p-8 pt-24">
      <div className="mx-auto max-w-[1200px]">
        <Button
          className="-ml-2 mb-4 gap-2 px-2"
          onClick={() => navigate(PATH.BRAND_PROMOTION)}
          variant="ghost"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로 돌아가기
        </Button>

        <div className="mb-6">
          <h2 className="text-title-4 mb-2 font-semibold">{title}</h2>
          <p className="text-sm text-black/60">{description}</p>
        </div>

        <div className="mb-6 grid grid-cols-6 rounded-[14px] bg-[#ececf1] p-1">
          {TAB_ITEMS.map((tab) => {
            const isActive = tab.id === form.activeTab;

            return (
              <button
                className={`rounded-[12px] px-3 py-[10px] text-sm font-medium transition ${isActive ? "bg-white text-black shadow-sm" : "text-black/80"}`}
                key={tab.id}
                onClick={() => form.setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-[16px] border border-black/10 bg-white px-5 py-5">
          <BrandPromotionFormContent
            brandOptions={brandOptions}
            form={form}
            isBrandLoading={isBrandLoading}
          />
        </div>

        <div className="mt-9 flex justify-end gap-2">
          <Button
            className="h-[36px] rounded-[8px] px-4 text-sm"
            onClick={() => navigate(PATH.BRAND_PROMOTION)}
            size="sm"
            type="button"
            variant="outline"
          >
            취소
          </Button>
          <Button
            className="h-[36px] rounded-[8px] px-4 text-sm"
            disabled={!onSubmit}
            isLoading={isLoading}
            onClick={handleSubmit}
            size="sm"
            type="button"
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
