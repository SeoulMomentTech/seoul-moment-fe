import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import type {
  GetAdminPromotionDetailResponse,
  PatchAdminPromotionRequest,
  PostAdminPromotionRequest,
} from "@shared/services/promotion";
import { uploadImageFile } from "@shared/utils/image";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const promotionSchema = z.object({
  bannerImagePath: z.string().optional(),
  bannerMobileImagePath: z.string().optional(),
  thumbnailImagePath: z.string().optional(),
  startDate: z.string().min(1, "시작일을 입력해주세요"),
  endDate: z.string().min(1, "종료일을 입력해주세요"),
  isActive: z.boolean(),
  language: z.array(
    z.object({
      languageId: z.number().optional(),
      languageCode: z.enum(["ko", "en", "zh"]).optional(),
      title: z.string().min(1, "제목을 입력해주세요"),
      description: z.string().min(1, "설명을 입력해주세요"),
    })
  ).min(1, "최소 1개의 언어 정보가 필요합니다"),
});

export type PromotionFormValues = z.infer<typeof promotionSchema>;

type UsePromotionFormProps =
  | {
    defaultValues?: GetAdminPromotionDetailResponse;
    mode: "add";
    onSubmit(data: PostAdminPromotionRequest): void;
  }
  | {
    defaultValues?: GetAdminPromotionDetailResponse;
    mode: "edit";
    onSubmit(data: PatchAdminPromotionRequest): void;
  };

export function usePromotionForm({ defaultValues, mode, onSubmit }: UsePromotionFormProps) {
  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      bannerImagePath: "",
      bannerMobileImagePath: "",
      thumbnailImagePath: "",
      startDate: "",
      endDate: "",
      isActive: true,
      language: [
        { languageCode: "ko", languageId: 1, title: "", description: "" },
        { languageCode: "en", languageId: 2, title: "", description: "" },
        { languageCode: "zh", languageId: 3, title: "", description: "" },
      ],
    },
  });

  const [bannerPreview, setBannerPreview] = useState("");
  const [mobileBannerPreview, setMobileBannerPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        bannerImagePath: defaultValues.bannerImageUrl,
        bannerMobileImagePath: defaultValues.bannerMobileImageUrl,
        thumbnailImagePath: defaultValues.thumbnailImageUrl,
        startDate: defaultValues.startDate
          ? new Date(defaultValues.startDate).toISOString().split("T")[0]
          : "",
        endDate: defaultValues.endDate
          ? new Date(defaultValues.endDate).toISOString().split("T")[0]
          : "",
        isActive: defaultValues.isActive,
        language:
          defaultValues.language.length > 0
            ? defaultValues.language.map((lang, index) => ({
              languageId: index + 1,
              languageCode: lang.languageCode === "zh-TW" ? "zh" : (lang.languageCode as "ko" | "en" | "zh"),
              title: lang.title,
              description: lang.description,
            }))
            : [
              { languageCode: "ko", languageId: 1, title: "", description: "" },
              { languageCode: "en", languageId: 2, title: "", description: "" },
              { languageCode: "zh", languageId: 3, title: "", description: "" },
            ],
      });
      setBannerPreview(defaultValues.bannerImageUrl || "");
      setMobileBannerPreview(defaultValues.bannerMobileImageUrl || "");
      setThumbnailPreview(defaultValues.thumbnailImageUrl || "");
    }
  }, [defaultValues, form]);

  const handleSubmit = async (values: PromotionFormValues) => {
    try {
      const banner = values.bannerImagePath || "";
      const mobileBanner = values.bannerMobileImagePath || "";
      const thumbnail = values.thumbnailImagePath || "";

      if (!banner || !mobileBanner || !thumbnail) {
        alert("모든 이미지를 업로드해주세요.");
        return;
      }

      const basePayload = {
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        isActive: values.isActive,
      };

      if (mode === "add") {
        onSubmit({
          ...basePayload,
          bannerImagePath: banner,
          bannerMobileImagePath: mobileBanner,
          thumbnailImagePath: thumbnail,
          language: values.language.map((lang) => ({
            languageId: lang.languageId ?? 0,
            title: lang.title,
            description: lang.description,
          })),
        });
      } else {
        onSubmit({
          ...basePayload,
          bannerImageUrl: banner,
          bannerMobileImageUrl: mobileBanner,
          thumbnailImageUrl: thumbnail,
          language: values.language.map((lang) => ({
            languageCode: (lang.languageCode === "zh" ? "zh-TW" : (lang.languageCode as "ko" | "en" | "zh-TW")),
            title: lang.title,
            description: lang.description,
          })),
        });
      }
    } catch (error) {
      console.error(error);
      alert("데이터 처리 중 오류가 발생했습니다.");
    }
  };

  const handleFileChange = (field: "banner" | "mobileBanner" | "thumbnail") =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const previewUrl = URL.createObjectURL(file);
        const { imagePath } = await uploadImageFile(file, "promotion");

        if (field === "banner") {
          setBannerPreview(previewUrl);
          form.setValue("bannerImagePath", imagePath);
        } else if (field === "mobileBanner") {
          setMobileBannerPreview(previewUrl);
          form.setValue("bannerMobileImagePath", imagePath);
        } else if (field === "thumbnail") {
          setThumbnailPreview(previewUrl);
          form.setValue("thumbnailImagePath", imagePath);
        }
      } catch {
        alert("이미지 업로드 중 오류가 발생했습니다.");
      }
    };

  const handleFileClear = (field: "banner" | "mobileBanner" | "thumbnail") => () => {
    if (field === "banner") {
      setBannerPreview("");
      form.setValue("bannerImagePath", "");
    } else if (field === "mobileBanner") {
      setMobileBannerPreview("");
      form.setValue("bannerMobileImagePath", "");
    } else if (field === "thumbnail") {
      setThumbnailPreview("");
      form.setValue("thumbnailImagePath", "");
    }
  };

  return {
    form,
    bannerPreview,
    mobileBannerPreview,
    thumbnailPreview,
    handleSubmit,
    handleFileChange,
    handleFileClear,
  };
}
