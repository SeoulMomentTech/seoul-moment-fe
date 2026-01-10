import { Plus, Trash2 } from "lucide-react";

import { MultipleImageUpload } from "@shared/components/multi-image-upload";
import { LANGUAGE_LIST } from "@shared/constants/locale";
import { type CreateAdminNewsRequest } from "@shared/services/news";

import {
  Button,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  VStack,
} from "@seoul-moment/ui";

type NewsSection = CreateAdminNewsRequest["sectionList"][number];

interface NewsDetailSectionsProps {
  sections: NewsSection[];
  sectionKeys: string[];
  errors?: Record<string, string | undefined>;
  onAddSection(): void;
  onRemoveSection(index: number): void;
  onChangeText(
    index: number,
    languageId: number,
    field: "title" | "subTitle" | "content",
    value: string,
  ): void;
  onImagesChange(index: number, urls: string[]): void;
}

const getLanguageLabel = (languageCode: string) => {
  if (languageCode === "en") return "English";
  if (languageCode === "zh") return "繁體中文";
  return "한국어";
};

export function NewsDetailSections({
  sections,
  sectionKeys,
  errors,
  onAddSection,
  onRemoveSection,
  onChangeText,
  onImagesChange,
}: NewsDetailSectionsProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div>
          <h3 className="text-base font-semibold">상세 섹션</h3>
          <p className="mt-1 text-sm text-gray-600">
            뉴스의 상세 섹션을 추가할 수 있습니다.
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={onAddSection}
          type="button"
        >
          <Plus className="h-4 w-4" />
          섹션 추가
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-gray-500">
          섹션을 추가하여 상세 내용을 작성하세요.
        </div>
      ) : (
        <div className="space-y-4 px-6 py-5">
          {sections.map((section, sectionIndex) => (
            <div
              className="rounded-lg border border-gray-200 p-5"
              key={sectionKeys[sectionIndex]}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">
                  섹션 {sectionIndex + 1}
                </h4>
                <Button
                  onClick={() => onRemoveSection(sectionIndex)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor={`news-section-image-${sectionIndex}`}>
                  이미지
                </Label>
                <MultipleImageUpload
                  folder="news"
                  label="이미지 업로드"
                  maxImages={1}
                  onChange={(urls) => onImagesChange(sectionIndex, urls)}
                  required
                  value={section.imageUrlList}
                />
                {errors?.[`section_images_${sectionIndex}`] && (
                  <p className="text-sm text-red-500">
                    {errors?.[`section_images_${sectionIndex}`]}
                  </p>
                )}
              </div>

              <Tabs
                className="mt-6 w-full"
                defaultValue={LANGUAGE_LIST[0].code}
              >
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
                  const text = section.textList.find(
                    (item) => item.languageId === language.id,
                  );
                  if (!text) return null;

                  return (
                    <TabsContent
                      className="mt-6 space-y-4"
                      key={`${sectionKeys[sectionIndex]}-${language.id}`}
                      value={language.code}
                    >
                      <VStack gap={8}>
                        <div className="w-full space-y-2">
                          <Label
                            htmlFor={`section-title-${sectionIndex}-${language.id}`}
                          >
                            제목
                          </Label>
                          <Input
                            className={
                              errors?.[
                                `section_title_${sectionIndex}_${language.id}`
                              ]
                                ? "border-red-500"
                                : ""
                            }
                            id={`section-title-${sectionIndex}-${language.id}`}
                            onChange={(e) =>
                              onChangeText(
                                sectionIndex,
                                language.id,
                                "title",
                                e.target.value,
                              )
                            }
                            placeholder="섹션 제목"
                            value={text.title}
                          />
                          {errors?.[
                            `section_title_${sectionIndex}_${language.id}`
                          ] && (
                            <p className="text-sm text-red-500">
                              {
                                errors?.[
                                  `section_title_${sectionIndex}_${language.id}`
                                ]
                              }
                            </p>
                          )}
                        </div>
                        <div className="w-full space-y-2">
                          <Label
                            htmlFor={`section-subtitle-${sectionIndex}-${language.id}`}
                          >
                            부제목
                          </Label>
                          <Input
                            id={`section-subtitle-${sectionIndex}-${language.id}`}
                            onChange={(e) =>
                              onChangeText(
                                sectionIndex,
                                language.id,
                                "subTitle",
                                e.target.value,
                              )
                            }
                            placeholder="부제목"
                            value={text.subTitle}
                          />
                        </div>
                        <div className="w-full space-y-2">
                          <Label
                            htmlFor={`section-content-${sectionIndex}-${language.id}`}
                          >
                            내용
                          </Label>
                          <Textarea
                            className={
                              errors?.[
                                `section_content_${sectionIndex}_${language.id}`
                              ]
                                ? "border-red-500"
                                : ""
                            }
                            id={`section-content-${sectionIndex}-${language.id}`}
                            onChange={(e) =>
                              onChangeText(
                                sectionIndex,
                                language.id,
                                "content",
                                e.target.value,
                              )
                            }
                            placeholder="상세 내용"
                            rows={4}
                            value={text.content}
                          />
                          {errors?.[
                            `section_content_${sectionIndex}_${language.id}`
                          ] && (
                            <p className="text-sm text-red-500">
                              {
                                errors?.[
                                  `section_content_${sectionIndex}_${language.id}`
                                ]
                              }
                            </p>
                          )}
                        </div>
                      </VStack>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
