import { useEffect, useState } from "react";

import { useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUploader } from "@shared/components/image-uploader";
import { LANGUAGE_LIST } from "@shared/constants/locale";
import type { GetAdminPromotionDetailResponse } from "@shared/services/promotion";
import { uploadImageFile } from "@shared/utils/image";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import {
  Button,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@seoul-moment/ui";


const promotionSchema = z.object({
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

interface PromotionFormProps {
  defaultValues?: GetAdminPromotionDetailResponse;
  isEditMode?: boolean;
  isSubmitting: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit(data: any): void;
}

const getLanguageLabel = (languageCode: string | undefined) => {
  if (languageCode === "en") return "영어";
  if (languageCode === "zh") return "중국어";
  return "한국어";
};

export function PromotionForm({
  defaultValues,
  isSubmitting,
  onSubmit,
}: PromotionFormProps) {
  const navigate = useNavigate();

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

  const { fields } = useFieldArray({
    control: form.control,
    name: "language",
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [mobileBannerFile, setMobileBannerFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

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
                languageId: index + 1, // API doesn't provide ID in Get, so we map by index or keep it for form
                languageCode: lang.languageCode === "zh-TW" ? "zh" : lang.languageCode as "ko" | "en" | "zh",
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
      let banner = values.bannerImagePath || "";
      if (bannerFile) {
        const res = await uploadImageFile(bannerFile, "promotion");
        banner = res.imagePath;
      }

      let mobileBanner = values.bannerMobileImagePath || "";
      if (mobileBannerFile) {
        const res = await uploadImageFile(mobileBannerFile, "promotion");
        mobileBanner = res.imagePath;
      }

      let thumbnail = values.thumbnailImagePath || "";
      if (thumbnailFile) {
        const res = await uploadImageFile(thumbnailFile, "promotion");
        thumbnail = res.imagePath;
      }

      if (!banner || !mobileBanner || !thumbnail) {
        alert("모든 이미지를 업로드해주세요.");
        return;
      }

      // Map internal 'zh' back to 'zh-TW' and prepare payloads for Create or Update
      const languagePayload = values.language.map((lang) => ({
        languageId: lang.languageId ?? 0,
        languageCode: (lang.languageCode === "zh" ? "zh-TW" : lang.languageCode) as "ko" | "en" | "zh-TW",
        title: lang.title,
        description: lang.description,
      }));

      const submitData = {
        bannerImageUrl: banner,
        bannerMobileImageUrl: mobileBanner,
        thumbnailImageUrl: thumbnail,
        bannerImagePath: banner,
        bannerMobileImagePath: mobileBanner,
        thumbnailImagePath: thumbnail,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        isActive: values.isActive,
        language: languagePayload,
      };

      onSubmit(submitData);
    } catch (error) {
      console.error(error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    }
  };

  const handleFileChange =
    (field: "banner" | "mobileBanner" | "thumbnail") =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);

        if (field === "banner") {
          setBannerFile(file);
          setBannerPreview(previewUrl);
          form.setValue("bannerImagePath", previewUrl);
        } else if (field === "mobileBanner") {
          setMobileBannerFile(file);
          setMobileBannerPreview(previewUrl);
          form.setValue("bannerMobileImagePath", previewUrl);
        } else if (field === "thumbnail") {
          setThumbnailFile(file);
          setThumbnailPreview(previewUrl);
          form.setValue("thumbnailImagePath", previewUrl);
        }
      };

  const handleFileClear = (field: "banner" | "mobileBanner" | "thumbnail") => () => {
    if (field === "banner") {
      setBannerFile(null);
      setBannerPreview("");
      form.setValue("bannerImagePath", "");
    } else if (field === "mobileBanner") {
      setMobileBannerFile(null);
      setMobileBannerPreview("");
      form.setValue("bannerMobileImagePath", "");
    } else if (field === "thumbnail") {
      setThumbnailFile(null);
      setThumbnailPreview("");
      form.setValue("thumbnailImagePath", "");
    }
  };

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
      {/* 기본 정보 */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-base font-semibold">기본 정보</h3>
        </div>
        <div className="px-6 py-5">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label>
                활성 상태 <span className="text-red-500">*</span>
              </Label>
              <div className="flex h-[36px] items-center space-x-2">
                <input
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  id="isActive"
                  type="checkbox"
                  {...form.register("isActive")}
                />
                <Label className="cursor-pointer" htmlFor="isActive">
                  활성화
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">
                시작일 <span className="text-red-500">*</span>
              </Label>
              <Input
                className={form.formState.errors.startDate ? "border-red-500" : ""}
                id="startDate"
                type="date"
                {...form.register("startDate")}
              />
              {form.formState.errors.startDate && (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.startDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">
                종료일 <span className="text-red-500">*</span>
              </Label>
              <Input
                className={form.formState.errors.endDate ? "border-red-500" : ""}
                id="endDate"
                type="date"
                {...form.register("endDate")}
              />
              {form.formState.errors.endDate && (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.endDate.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 이미지 */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-base font-semibold">메인 이미지</h3>
          <p className="mt-1 text-sm text-gray-600">
            프로모션 배너 및 썸네일 이미지를 업로드하세요.
          </p>
        </div>
        <div className="px-6 py-5">
          <div className="grid gap-6 md:grid-cols-3">
            <ImageUploader
              id="promotion-banner"
              label="배너 이미지 (PC)"
              onChange={handleFileChange("banner")}
              onClear={handleFileClear("banner")}
              preview={bannerPreview}
              required
            />
            <ImageUploader
              id="promotion-mobile-banner"
              label="모바일 배너 이미지"
              onChange={handleFileChange("mobileBanner")}
              onClear={handleFileClear("mobileBanner")}
              preview={mobileBannerPreview}
              required
            />
            <ImageUploader
              id="promotion-thumbnail"
              label="썸네일 이미지"
              onChange={handleFileChange("thumbnail")}
              onClear={handleFileClear("thumbnail")}
              preview={thumbnailPreview}
              required
            />
          </div>
          {(!bannerPreview || !mobileBannerPreview || !thumbnailPreview) &&
            form.formState.isSubmitted && (
              <p className="mt-4 text-sm text-red-500">
                모든 이미지를 등록해야 합니다.
              </p>
            )}
        </div>
      </div>

      {/* 다국어 정보 */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-base font-semibold">다국어 정보</h3>
          <p className="mt-1 text-sm text-gray-600">
            프로모션의 언어별 제목과 설명을 입력하세요.
          </p>
        </div>
        <div className="p-6">
          <Tabs className="w-full" defaultValue={LANGUAGE_LIST[0].code}>
            <TabsList className="grid h-auto w-full grid-cols-3 rounded-full bg-gray-100 p-1">
              {LANGUAGE_LIST.map((language) => (
                <TabsTrigger
                  className="rounded-full border-b-0 px-3 py-2 text-sm"
                  key={language.id}
                  value={language.code}
                >
                  {getLanguageLabel(language.code)}
                </TabsTrigger>
              ))}
            </TabsList>

            {fields.map((field, index) => {
              const languageCode = field.languageCode || "ko";
              const titleError = form.formState.errors.language?.[index]?.title;
              const descriptionError =
                form.formState.errors.language?.[index]?.description;

              return (
                <TabsContent
                  className="mt-6 space-y-6"
                  key={field.id}
                  value={languageCode}
                >
                  <div className="space-y-2">
                    <Label htmlFor={`title_${index}`}>
                      제목 ({getLanguageLabel(languageCode)})
                      <span className="text-red-500"> *</span>
                    </Label>
                    <Input
                      className={titleError ? "border-red-500" : ""}
                      id={`title_${index}`}
                      {...form.register(`language.${index}.title`)}
                      placeholder="프로모션 제목을 입력하세요"
                    />
                    {titleError && (
                      <p className="mt-1 text-sm text-red-500">
                        {titleError.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`desc_${index}`}>
                      설명 ({getLanguageLabel(languageCode)})
                      <span className="text-red-500"> *</span>
                    </Label>
                    <Textarea
                      className={descriptionError ? "border-red-500" : ""}
                      id={`desc_${index}`}
                      rows={4}
                      {...form.register(`language.${index}.description`)}
                      placeholder="프로모션 설명을 입력하세요"
                    />
                    {descriptionError && (
                      <p className="mt-1 text-sm text-red-500">
                        {descriptionError.message}
                      </p>
                    )}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>

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
  );
}
