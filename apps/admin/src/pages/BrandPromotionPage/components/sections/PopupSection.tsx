import { Plus, Trash2 } from "lucide-react";

import { MultipleImageUpload } from "@shared/components/multi-image-upload";
import { LANGUAGE_LIST } from "@shared/constants/locale";

import { Button, Input, Textarea } from "@seoul-moment/ui";

import { FORM_INPUT_CLASS, FORM_TEXTAREA_CLASS } from "../../constants/form";
import type { PopupFormValue } from "../../types";
import { getLanguageCode, getLanguageLabel } from "../../utils/form";
import { Card, FieldLabel, SectionHeader } from "../FormShare";

interface PopupSectionProps {
  onAdd(): void;
  onChange(index: number, nextValue: PopupFormValue): void;
  onRemove(index: number): void;
  popups: PopupFormValue[];
}

export function PopupSection({
  onAdd,
  onChange,
  onRemove,
  popups,
}: PopupSectionProps) {
  return (
    <>
      <SectionHeader
        action={
          <Button
            className="gap-1"
            onClick={onAdd}
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            팝업 추가
          </Button>
        }
        title="팝업 목록"
      />
      <div className="space-y-4">
        {popups.map((popup, index) => (
          <Card key={`popup-${index + 1}`}>
            <div className="mb-4 flex items-center justify-between">
              <div className="font-semibold">팝업 #{index + 1}</div>
              <button
                className="text-red-500"
                onClick={() => onRemove(index)}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {(
                [
                  ["장소", "place"],
                  ["주소", "address"],
                  ["위도", "latitude"],
                  ["경도", "longitude"],
                ] as const
              ).map(([label, key]) => (
                <div key={key}>
                  <FieldLabel>{label}</FieldLabel>
                  <Input
                    className={FORM_INPUT_CLASS}
                    onChange={(event) =>
                      onChange(index, { ...popup, [key]: event.target.value })
                    }
                    value={popup[key]}
                  />
                </div>
              ))}
              <div>
                <FieldLabel>시작 날짜</FieldLabel>
                <Input
                  className={FORM_INPUT_CLASS}
                  onChange={(event) =>
                    onChange(index, { ...popup, startDate: event.target.value })
                  }
                  type="date"
                  value={popup.startDate}
                />
              </div>
              <div>
                <FieldLabel>시작 시간</FieldLabel>
                <Input
                  className={FORM_INPUT_CLASS}
                  onChange={(event) =>
                    onChange(index, { ...popup, startTime: event.target.value })
                  }
                  type="time"
                  value={popup.startTime}
                />
              </div>
              <div>
                <FieldLabel>종료 날짜</FieldLabel>
                <Input
                  className={FORM_INPUT_CLASS}
                  onChange={(event) =>
                    onChange(index, { ...popup, endDate: event.target.value })
                  }
                  type="date"
                  value={popup.endDate}
                />
              </div>
              <div>
                <FieldLabel>종료 시간</FieldLabel>
                <Input
                  className={FORM_INPUT_CLASS}
                  onChange={(event) =>
                    onChange(index, { ...popup, endTime: event.target.value })
                  }
                  type="time"
                  value={popup.endTime}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm font-medium">활성화</span>
              <button
                aria-pressed={popup.isActive}
                className={`relative h-6 w-11 rounded-full transition ${popup.isActive ? "bg-black" : "bg-black/15"}`}
                onClick={() =>
                  onChange(index, { ...popup, isActive: !popup.isActive })
                }
                type="button"
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${popup.isActive ? "left-[22px]" : "left-0.5"}`}
                />
              </button>
            </div>
            <div className="mt-4">
              <MultipleImageUpload
                folder="brand"
                label="팝업 이미지 (다중 선택)"
                maxImages={10}
                onChange={(urls) =>
                  onChange(index, { ...popup, imagePathList: urls })
                }
                value={popup.imagePathList.filter(Boolean)}
              />
            </div>
            <div className="mt-4">
              <FieldLabel>팝업 정보 (다국어)</FieldLabel>
              <div className="space-y-3">
                {LANGUAGE_LIST.map((language) => {
                  const code = getLanguageCode(language.code);
                  return (
                    <Card className="p-3" key={`${index + 1}-${language.id}`}>
                      <div className="mb-3 text-sm font-medium">
                        {getLanguageLabel(language.id)}
                      </div>
                      <div className="mb-3">
                        <FieldLabel>제목</FieldLabel>
                        <Input
                          className={FORM_INPUT_CLASS}
                          onChange={(event) =>
                            onChange(index, {
                              ...popup,
                              content: {
                                ...popup.content,
                                [code]: {
                                  ...popup.content[code],
                                  title: event.target.value,
                                },
                              },
                            })
                          }
                          value={popup.content[code].title}
                        />
                      </div>
                      <FieldLabel>설명</FieldLabel>
                      <Textarea
                        className={`${FORM_TEXTAREA_CLASS} min-h-[96px]`}
                        onChange={(event) =>
                          onChange(index, {
                            ...popup,
                            content: {
                              ...popup.content,
                              [code]: {
                                ...popup.content[code],
                                description: event.target.value,
                              },
                            },
                          })
                        }
                        value={popup.content[code].description}
                      />
                    </Card>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
