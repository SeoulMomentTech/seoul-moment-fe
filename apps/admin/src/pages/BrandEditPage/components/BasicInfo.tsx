import { useEffect, useMemo } from "react";

import { Upload } from "lucide-react";

import { useAdminCategoryListQuery } from "@pages/ProductCategoriesPage/hooks";
import { LANGUAGE_LIST } from "@shared/constants/locale";
import { type CreateAdminBrandRequest } from "@shared/services/brand";
import { type AdminCategory } from "@shared/services/category";
import { type FormikProps } from "formik";

import { Button, Input, Label, Textarea } from "@seoul-moment/ui";

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

  useEffect(() => {
    if (!categories.length) return;
    const hasCurrent = categories.some(
      (category) => Number(category.id) === values.categoryId,
    );
    if (!hasCurrent) {
      setFieldValue("categoryId", Number(categories[0].id));
    }
  }, [categories, setFieldValue, values.categoryId]);

  const updateTextList = (
    languageId: number,
    field: "name" | "description",
    value: string,
  ) => {
    const updated = values.textList.map((text) =>
      text.languageId === languageId ? { ...text, [field]: value } : text,
    );
    setFieldValue("textList", updated);
  };

  const getCategoryName = (category: AdminCategory) =>
    category.nameDto.find((name) => name.languageCode === "ko")?.name ??
    category.nameDto[0]?.name ??
    `카테고리 ${category.id}`;

  const hasCategories = categories.length > 0;
  const categorySelectValue = hasCategories ? values.categoryId : "";

  return (
    <div className="space-y-6">
      {/* 이미지 업로드 섹션 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 font-semibold">브랜드 이미지</h3>
        <div className="space-y-6">
          {/* 프로필 이미지 - 작은 크기 */}
          <div className="space-y-3">
            <Label>
              프로필 이미지 <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-500">
              브랜드를 대표하는 로고 또는 이미지
            </p>
            <div className="max-w-xs">
              {values.profileImageUrl ? (
                <div className="relative">
                  <img
                    alt="Profile"
                    className="h-48 w-48 rounded-lg border-2 border-gray-200 object-cover"
                    src={values.profileImageUrl}
                  />
                  <Button
                    className="absolute right-2 top-2"
                    onClick={() => setFieldValue("profileImageUrl", "")}
                    size="sm"
                    type="button"
                    variant="destructive"
                  >
                    변경
                  </Button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div
                    className={`flex h-48 w-48 flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                      errors.profileImageUrl
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="mb-1 text-sm text-gray-600">이미지 업로드</p>
                    <p className="text-xs text-gray-500">
                      정사각형 이미지 권장
                    </p>
                  </div>
                  <input
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFieldValue(
                            "profileImageUrl",
                            reader.result as string,
                          );
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    type="file"
                  />
                </label>
              )}
            </div>
            {errors.profileImageUrl && (
              <p className="text-sm text-red-500">{errors.profileImageUrl}</p>
            )}
          </div>

          {/* 대표 배너 이미지 - 큰 크기 */}
          <div className="space-y-3">
            <Label>대표 배너 이미지</Label>
            <p className="text-sm text-gray-500">
              브랜드 페이지 상단에 노출되는 이미지
            </p>
            {values.bannerImageUrl ? (
              <div className="relative max-w-2xl">
                <img
                  alt="Banner"
                  className="aspect-21/9 w-full rounded-lg border-2 border-gray-200 object-cover"
                  src={values.bannerImageUrl}
                />
                <Button
                  className="absolute right-2 top-2"
                  onClick={() => setFieldValue("bannerImageUrl", "")}
                  size="sm"
                  type="button"
                  variant="destructive"
                >
                  변경
                </Button>
              </div>
            ) : (
              <label className="block max-w-2xl cursor-pointer">
                <div className="aspect-21/9 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center transition-colors hover:border-gray-400 hover:bg-gray-50">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="mb-1 text-sm text-gray-600">이미지 업로드</p>
                  <p className="text-xs text-gray-500">
                    와이드 이미지 권장 (21:9 비율)
                  </p>
                </div>
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFieldValue(
                          "bannerImageUrl",
                          reader.result as string,
                        );
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  type="file"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* 기본 정보 섹션 */}
      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">기본 정보</h3>

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
          <Label htmlFor="categoryId">
            카테고리 <span className="text-red-500">*</span>
          </Label>
          <select
            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            disabled={isCategoryLoading || !hasCategories}
            id="categoryId"
            onChange={(e) =>
              setFieldValue("categoryId", Number(e.target.value))
            }
            value={categorySelectValue}
          >
            {hasCategories ? (
              categories.map((category) => (
                <option key={category.id} value={Number(category.id)}>
                  {getCategoryName(category)}
                </option>
              ))
            ) : (
              <option value="">카테고리가 없습니다</option>
            )}
          </select>
        </div>

        {/* 다국어 정보 */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="mb-6 font-semibold">다국어 정보</h4>
          <div className="space-y-8">
            {LANGUAGE_LIST.map((language) => {
              const text = values.textList.find(
                (item) => item.languageId === language.id,
              );
              if (!text) return null;

              return (
                <div
                  className="space-y-4 border-b border-gray-200 pb-8 last:border-b-0 last:pb-0"
                  key={language.id}
                >
                  <h5 className="font-semibold text-gray-700">
                    {language.name}
                  </h5>

                  <div className="space-y-2">
                    <Label htmlFor={`name_${language.id}`}>
                      브랜드명 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      className={
                        errors[`name_${language.id}`] ? "border-red-500" : ""
                      }
                      id={`name_${language.id}`}
                      onChange={(e) =>
                        updateTextList(language.id, "name", e.target.value)
                      }
                      placeholder={
                        language.code === "ko"
                          ? "서울모먼트"
                          : language.code === "en"
                            ? "Seoul Moment"
                            : "首爾時刻"
                      }
                      value={text.name}
                    />
                    {errors[`name_${language.id}`] && (
                      <p className="text-sm text-red-500">
                        {errors[`name_${language.id}`]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`description_${language.id}`}>
                      설명 <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      className={
                        errors[`description_${language.id}`]
                          ? "border-red-500"
                          : ""
                      }
                      id={`description_${language.id}`}
                      onChange={(e) =>
                        updateTextList(
                          language.id,
                          "description",
                          e.target.value,
                        )
                      }
                      placeholder={
                        language.code === "ko"
                          ? "서울의 특별한 순간들을 담은 라이프스타일 브랜드입니다."
                          : language.code === "en"
                            ? "A lifestyle brand that captures special moments in Seoul."
                            : "捕捉首爾特殊時刻的生活方式品牌。"
                      }
                      rows={3}
                      value={text.description}
                    />
                    {errors[`description_${language.id}`] && (
                      <p className="text-sm text-red-500">
                        {errors[`description_${language.id}`]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
