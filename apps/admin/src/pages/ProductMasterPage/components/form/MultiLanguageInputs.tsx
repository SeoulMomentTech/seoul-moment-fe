import type { ChangeEvent } from "react";

import type { PostAdminProductLanguage } from "@shared/services/adminProduct";
import type { FormikErrors } from "formik";

import { Input, Label } from "@seoul-moment/ui";

interface MultiLanguageInputsProps {
  values: PostAdminProductLanguage[];
  errors?: FormikErrors<PostAdminProductLanguage>[];
  onChange(e: ChangeEvent<HTMLInputElement>): void;
}

export const MultiLanguageInputs = ({
  values,
  errors,
  onChange,
}: MultiLanguageInputsProps) => {
  const getLanguageLabel = (id: number) => {
    switch (id) {
      case 1:
        return "한국어";
      case 2:
        return "영어";
      case 3:
        return "중국어";
      default:
        return `Language ${id}`;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {values.map((lang, index) => (
        <div
          className="rounded-lg border border-gray-200 bg-gray-50 p-4"
          key={lang.languageId}
        >
          <h4 className="mb-4 font-medium">
            {getLanguageLabel(lang.languageId)}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex">
                이름 <span className="ml-1 text-red-500">*</span>
              </Label>
              <Input
                className={errors?.[index]?.name ? "border-red-500" : ""}
                name={`text[${index}].name`}
                onChange={onChange}
                placeholder={`이름 (${getLanguageLabel(lang.languageId)})`}
                value={lang.name}
              />
              {errors?.[index]?.name && (
                <p className="text-xs text-red-500">{errors[index]?.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex">
                원산지 <span className="ml-1 text-red-500">*</span>
              </Label>
              <Input
                className={errors?.[index]?.origin ? "border-red-500" : ""}
                name={`text[${index}].origin`}
                onChange={onChange}
                placeholder={`원산지 (${getLanguageLabel(lang.languageId)})`}
                value={lang.origin}
              />
              {errors?.[index]?.origin && (
                <p className="text-xs text-red-500">{errors[index]?.origin}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
