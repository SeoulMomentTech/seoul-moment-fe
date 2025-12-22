import { LANGUAGE_LIST } from "@shared/constants/locale";

import { Label, Input, Textarea } from "@seoul-moment/ui";

interface MultilingualText {
  languageId: number;
  name: string;
  description: string;
}

interface MultilingualFieldsProps {
  textList: MultilingualText[];
  errors: Record<string, string>;
  onChange(
    languageId: number,
    field: "name" | "description",
    value: string,
  ): void;
}

export function MultilingualFields({
  textList,
  errors,
  onChange,
}: MultilingualFieldsProps) {
  return (
    <div className="border-t border-gray-200 pt-6">
      <h4 className="mb-6 font-semibold">다국어 정보</h4>
      <div className="space-y-8">
        {LANGUAGE_LIST.map((language) => {
          const text = textList.find((item) => item.languageId === language.id);
          if (!text) return null;

          return (
            <div
              className="space-y-4 border-b border-gray-200 pb-8 last:border-b-0 last:pb-0"
              key={language.id}
            >
              <h5 className="font-semibold text-gray-700">{language.name}</h5>

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
                    onChange(language.id, "name", e.target.value)
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
                    errors[`description_${language.id}`] ? "border-red-500" : ""
                  }
                  id={`description_${language.id}`}
                  onChange={(e) =>
                    onChange(language.id, "description", e.target.value)
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
  );
}
