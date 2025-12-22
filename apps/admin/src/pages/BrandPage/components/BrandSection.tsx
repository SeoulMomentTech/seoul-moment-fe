import { Plus, Trash2 } from "lucide-react";

import { MultipleImageUpload } from "@shared/components/multi-image-upload";
import { LANGUAGE_LIST } from "@shared/constants/locale";
import { type CreateAdminBrandRequest } from "@shared/services/brand";
import { type FormikProps } from "formik";

import { Button, Input, Label, Textarea } from "@seoul-moment/ui";

import { createEmptySection } from "../utils/section";

interface BrandSectionsProps {
  formik: FormikProps<CreateAdminBrandRequest>;
}

export function BrandSections({ formik }: BrandSectionsProps) {
  const { values, setFieldValue, errors: formikErrors } = formik;
  const errors = formikErrors as Record<string, string>;
  const sectionList = values.sectionList;

  const addSection = () =>
    setFieldValue("sectionList", [...sectionList, createEmptySection()]);

  const removeSection = (index: number) => {
    if (sectionList.length <= 1) return;
    setFieldValue(
      "sectionList",
      sectionList.filter((_, i) => i !== index),
    );
  };

  const updateSectionText = (
    sectionIndex: number,
    languageId: number,
    field: "title" | "content",
    value: string,
  ) => {
    const updated = sectionList.map((section, idx) =>
      idx !== sectionIndex
        ? section
        : {
            ...section,
            textList: section.textList.map((text) =>
              text.languageId === languageId
                ? { ...text, [field]: value }
                : text,
            ),
          },
    );
    setFieldValue("sectionList", updated);
  };

  const updateSectionImages = (sectionIndex: number, urls: string[]) => {
    const updated = sectionList.map((section, idx) =>
      idx === sectionIndex ? { ...section, imageUrlList: urls } : section,
    );
    setFieldValue("sectionList", updated);
  };

  const getError = (
    sectionIndex: number,
    languageId: number,
    field: "title" | "content",
  ) => errors[`section_${sectionIndex}_${field}_${languageId}`];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={addSection} size="sm" type="button" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          섹션 추가
        </Button>
      </div>

      {sectionList.map((section, sectionIndex) => (
        <div
          className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          key={`section-${sectionIndex + 1}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">섹션 {sectionIndex + 1}</h3>
            {sectionList.length > 1 && (
              <Button
                onClick={() => removeSection(sectionIndex)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {LANGUAGE_LIST.map((language) => {
              const text = section.textList.find(
                (t) => t.languageId === language.id,
              );
              if (!text) return null;

              return (
                <div
                  className="space-y-3 border-b border-gray-100 pb-4 last:border-b-0"
                  key={language.id}
                >
                  <p className="text-sm font-medium text-gray-700">
                    {language.name}
                  </p>

                  <div className="space-y-2">
                    <Label
                      htmlFor={`section_${sectionIndex}_title_${language.id}`}
                    >
                      제목
                    </Label>
                    <Input
                      className={
                        getError(sectionIndex, language.id, "title")
                          ? "border-red-500"
                          : ""
                      }
                      id={`section_${sectionIndex}_title_${language.id}`}
                      onChange={(e) =>
                        updateSectionText(
                          sectionIndex,
                          language.id,
                          "title",
                          e.target.value,
                        )
                      }
                      placeholder={
                        language.code === "ko"
                          ? "브랜드 스토리"
                          : language.code === "en"
                            ? "Brand Story"
                            : "品牌故事"
                      }
                      value={text.title}
                    />
                    {getError(sectionIndex, language.id, "title") && (
                      <p className="text-sm text-red-500">
                        {getError(sectionIndex, language.id, "title")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor={`section_${sectionIndex}_content_${language.id}`}
                    >
                      내용
                    </Label>
                    <Textarea
                      className={
                        getError(sectionIndex, language.id, "content")
                          ? "border-red-500"
                          : ""
                      }
                      id={`section_${sectionIndex}_content_${language.id}`}
                      onChange={(e) =>
                        updateSectionText(
                          sectionIndex,
                          language.id,
                          "content",
                          e.target.value,
                        )
                      }
                      rows={3}
                      value={text.content}
                    />
                    {getError(sectionIndex, language.id, "content") && (
                      <p className="text-sm text-red-500">
                        {getError(sectionIndex, language.id, "content")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <MultipleImageUpload
            label="이미지"
            maxImages={sectionIndex === 0 ? 2 : 1}
            onChange={(urls) => updateSectionImages(sectionIndex, urls)}
            value={section.imageUrlList}
          />
        </div>
      ))}
    </div>
  );
}
