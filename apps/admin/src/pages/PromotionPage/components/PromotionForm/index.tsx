import { useNavigate } from "react-router";

import type {
  GetAdminPromotionDetailResponse,
  PatchAdminPromotionRequest,
  PostAdminPromotionRequest,
} from "@shared/services/promotion";
import { FormProvider } from "react-hook-form";

import { Button } from "@seoul-moment/ui";

import { PromotionBasicInfo } from "./PromotionBasicInfo";
import { PromotionImages } from "./PromotionImages";
import { PromotionLanguages } from "./PromotionLanguages";
import { usePromotionForm } from "./usePromotionForm";

type PromotionFormProps =
  | {
      defaultValues?: GetAdminPromotionDetailResponse;
      isSubmitting: boolean;
      mode: "add";
      onSubmit(data: PostAdminPromotionRequest): void;
    }
  | {
      defaultValues?: GetAdminPromotionDetailResponse;
      isSubmitting: boolean;
      mode: "edit";
      onSubmit(data: PatchAdminPromotionRequest): void;
    };

export function PromotionForm(props: PromotionFormProps) {
  const { defaultValues, isSubmitting, mode, onSubmit } = props;
  const navigate = useNavigate();

  const {
    form,
    bannerPreview,
    mobileBannerPreview,
    thumbnailPreview,
    handleSubmit,
    handleFileChange,
    handleFileClear,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = usePromotionForm({ defaultValues, mode, onSubmit } as any); // Type assertion needed here for the hook call due to discriminated union complexity in React components

  return (
    <FormProvider {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <PromotionBasicInfo />

        <PromotionImages
          bannerPreview={bannerPreview}
          handleFileChange={handleFileChange}
          handleFileClear={handleFileClear}
          mobileBannerPreview={mobileBannerPreview}
          thumbnailPreview={thumbnailPreview}
        />

        <PromotionLanguages />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            onClick={() => navigate(-1)}
            type="button"
            variant="outline"
          >
            취소
          </Button>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
