import { LANGUAGE_LIST } from "@shared/constants/locale";

import { Input, Label, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from "@seoul-moment/ui";

import type { NewsFormErrors, NewsFormValues } from "../types";

interface NewsInfoCardProps {
  values: NewsFormValues;
  errors: NewsFormErrors;
  onChange(
    languageId: number,
    field: "title" | "content",
    value: string,
  ): void;
}

const getLanguageLabel = (languageCode: string) => {
  if (languageCode === "en") return "English";
  if (languageCode === "zh") return "繁體中文";
  return "한국어";
};

export function NewsInfoCard({ values, errors, onChange }: NewsInfoCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-base font-semibold">뉴스 정보</h3>
        <p className="mt-1 text-sm text-gray-600">
          다국어로 뉴스 제목과 내용을 입력하세요.
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

          {LANGUAGE_LIST.map((language) => {
            const text = values.list.find(
              (item) => item.languageId === language.id,
            );
            if (!text) return null;

            const titleError = errors[`title_${language.id}`];
            const contentError = errors[`content_${language.id}`];

            return (
              <TabsContent className="mt-6 space-y-6" key={language.id} value={language.code}>
                <div className="space-y-2">
                  <Label htmlFor={`title_${language.id}`}>
                    제목 ({getLanguageLabel(language.code)})
                    {language.code === "ko" && (
                      <span className="text-red-500"> *</span>
                    )}
                  </Label>
                  <Input
                    className={titleError ? "border-red-500" : ""}
                    id={`title_${language.id}`}
                    maxLength={100}
                    onChange={(e) =>
                      onChange(language.id, "title", e.target.value)
                    }
                    placeholder={
                      language.code === "ko"
                        ? "예: 서울모먼트 신규 브랜드 입점 안내"
                        : "Enter title"
                    }
                    value={text.title}
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{titleError ?? ""}</span>
                    <span>{text.title.length} / 100자</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`content_${language.id}`}>
                    내용 ({getLanguageLabel(language.code)})
                    {language.code === "ko" && (
                      <span className="text-red-500"> *</span>
                    )}
                  </Label>
                  <Textarea
                    className={contentError ? "border-red-500" : ""}
                    id={`content_${language.id}`}
                    onChange={(e) =>
                      onChange(language.id, "content", e.target.value)
                    }
                    placeholder={
                      language.code === "ko"
                        ? "뉴스의 상세 내용을 입력하세요..."
                        : "Enter content"
                    }
                    rows={5}
                    value={text.content}
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{contentError ?? ""}</span>
                    <span>{text.content.length}자</span>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
