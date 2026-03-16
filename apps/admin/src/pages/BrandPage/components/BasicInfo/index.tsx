import { useCallback, useEffect, useMemo } from "react";

import { useAdminCategoryListQuery } from "@pages/ProductCategoriesPage/hooks";
import { type CreateAdminBrandRequest } from "@shared/services/brand";
import { uploadImageFile } from "@shared/utils/image";
import { type FormikProps } from "formik";

import { Flex, Input, Label } from "@seoul-moment/ui";

import { CategorySelect } from "./CategorySelect";
import { BannerImageUploader, ProfileImageUploader } from "./ImageUploaders";
import { MultilingualFields } from "./MultilingualFields";

interface BasicInfoProps {
  formik: FormikProps<CreateAdminBrandRequest>;
}

export function BasicInfo({ formik }: BasicInfoProps) {
  const { data: categoryResponse, isLoading: isCategoryLoading } =
    useAdminCategoryListQuery({ page: 1, count: 100 });
  const categories = useMemo(
    () => categoryResponse?.data.list ?? [],
    [categoryResponse],
  );

  const errors = formik.errors as Record<string, string>;
  const { values, setFieldValue, handleChange } = formik;

  const hasCategories = categories.length > 0;
  const categorySelectValue = hasCategories ? values.categoryId : "";

  const updateTextList = useCallback(
    (languageId: number, field: "name" | "description", value: string) => {
      const updated = values.textList.map((text) =>
        text.languageId === languageId ? { ...text, [field]: value } : text,
      );
      setFieldValue("textList", updated);
    },
    [setFieldValue, values.textList],
  );

  const handleImageUpload = useCallback(
    async (
      file: File | undefined,
      field: "profileImageUrl" | "productBannerImageUrl",
    ) => {
      if (!file) return;
      try {
        const { imageUrl } = await uploadImageFile(file, "brand");
        setFieldValue(field, imageUrl);
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        alert("이미지 업로드에 실패했습니다.");
      }
    },
    [setFieldValue],
  );

  useEffect(() => {
    if (!categories.length) return;
    const hasCurrent = categories.some(
      (category) => Number(category.id) === values.categoryId,
    );
    if (!hasCurrent) {
      setFieldValue("categoryId", Number(categories[0].id));
    }
  }, [categories, setFieldValue, values.categoryId]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 font-semibold">브랜드 이미지</h3>
        <div className="space-y-6">
          <ProfileImageUploader
            error={errors.profileImageUrl}
            onChange={(file) => handleImageUpload(file, "profileImageUrl")}
            onClear={() => setFieldValue("profileImageUrl", "")}
            value={values.profileImageUrl}
          />
          <BannerImageUploader
            onChange={(file) =>
              handleImageUpload(file, "productBannerImageUrl")
            }
            onClear={() => setFieldValue("productBannerImageUrl", "")}
            value={values.productBannerImageUrl}
          />
        </div>
      </div>

      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">기본 정보</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="englishName">
              영어 이름 <span className="text-red-500">*</span>
            </Label>
            <Input
              className={errors.englishName ? "border-red-500" : ""}
              id="englishName"
              name="englishName"
              onChange={handleChange}
              placeholder="Seoul Moment"
              value={values.englishName}
            />
            {errors.englishName && (
              <p className="text-sm text-red-500">{errors.englishName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="colorCode">
              브랜드 컬러 <span className="text-red-500">*</span>
            </Label>
            <Flex align="center" gap={8}>
              <Input
                className="w-12 h-10 p-1 cursor-pointer"
                id="colorCodePicker"
                name="colorCode"
                onChange={handleChange}
                type="color"
                value={values.colorCode}

              />
              <Input
                className={errors.colorCode ? "border-red-500 flex-1" : "flex-1"}
                disabled
                id="colorCode"
                name="colorCode"
                onChange={handleChange}
                placeholder="#000000"
                value={values.colorCode}
              />
            </Flex>
            {errors.colorCode && (
              <p className="text-sm text-red-500">{errors.colorCode}</p>
            )}
          </div>
        </div>

        <CategorySelect
          categories={categories}
          disabled={isCategoryLoading || !hasCategories}
          onChange={(value) => setFieldValue("categoryId", value)}
          value={categorySelectValue}
        />

        <MultilingualFields
          errors={errors}
          onChange={updateTextList}
          textList={values.textList}
        />
      </div>
    </div>
  );
}
