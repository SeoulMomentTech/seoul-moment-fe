import { Plus, Trash2 } from "lucide-react";

import { LANGUAGE_LIST } from "@shared/constants/locale";

import { Button, Textarea } from "@seoul-moment/ui";

import { FORM_TEXTAREA_CLASS } from "../../constants/form";
import type { NoticeFormValue } from "../../types";
import { getLanguageCode, getLanguageLabel } from "../../utils/form";
import { Card, FieldLabel, SectionHeader } from "../FormShare";

interface NoticeSectionProps {
  notices: NoticeFormValue[];
  onAdd(): void;
  onChange(index: number, nextValue: NoticeFormValue): void;
  onRemove(index: number): void;
}

export function NoticeSection({
  notices,
  onAdd,
  onChange,
  onRemove,
}: NoticeSectionProps) {
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
            공지사항 추가
          </Button>
        }
        title="공지사항 목록"
      />
      <div className="space-y-4">
        {notices.map((notice, index) => (
          <Card key={`notice-${index + 1}`}>
            <div className="mb-4 flex items-center justify-between">
              <div className="font-semibold">공지사항 #{index + 1}</div>
              <button
                className="text-red-500"
                onClick={() => onRemove(index)}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {LANGUAGE_LIST.map((language) => {
                const code = getLanguageCode(language.code);
                return (
                  <div key={`notice-${language.id}-${index + 1}`}>
                    <FieldLabel>
                      {getLanguageLabel(language.id)} 내용
                    </FieldLabel>
                    <Textarea
                      className={FORM_TEXTAREA_CLASS}
                      onChange={(event) =>
                        onChange(index, {
                          ...notice,
                          content: {
                            ...notice.content,
                            [code]: event.target.value,
                          },
                        })
                      }
                      value={notice.content[code]}
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
