import { LANGUAGE_LIST } from "@shared/constants/locale";
import { useFieldArray, useFormContext } from "react-hook-form";

import {
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@seoul-moment/ui";

import type { PromotionFormValues } from "./usePromotionForm";

const getLanguageLabel = (languageCode: string | undefined) => {
  if (languageCode === "en") return "영어";
  if (languageCode === "zh") return "중국어";
  return "한국어";
};

export function PromotionLanguages() {
  const { control, register, formState: { errors } } = useFormContext<PromotionFormValues>();

  const { fields } = useFieldArray({
    control,
    name: "language",
  });

  return (
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
            const titleError = errors.language?.[index]?.title;
            const descriptionError = errors.language?.[index]?.description;

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
                    {...register(`language.${index}.title` as const)}
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
                    {...register(`language.${index}.description` as const)}
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
  );
}
