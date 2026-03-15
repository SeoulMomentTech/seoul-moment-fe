import { Plus, Trash2 } from "lucide-react";

import { LANGUAGE_LIST } from "@shared/constants/locale";

import { Button, Input } from "@seoul-moment/ui";

import { FORM_INPUT_CLASS } from "../../constants/form";
import type { BannerFormValue } from "../../types";
import { getLanguageCode, getLanguageLabel } from "../../utils/form";
import {
  Card,
  FieldLabel,
  SectionHeader,
  SingleImageField,
} from '../FormShare';

interface BannerSectionProps {
  banners: BannerFormValue[];
  onAdd(): void;
  onChange(index: number, nextValue: BannerFormValue): void;
  onRemove(index: number): void;
}

export function BannerSection({
  banners,
  onAdd,
  onChange,
  onRemove,
}: BannerSectionProps) {
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
            배너 추가
          </Button>
        }
        title="배너 목록"
      />
      <div className="space-y-4">
        {banners.map((banner, index) => (
          <Card key={`banner-${index + 1}`}>
            <div className="mb-4 flex items-center justify-between">
              <div className="font-semibold">배너 #{index + 1}</div>
              <button
                className="text-red-500"
                onClick={() => onRemove(index)}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <SingleImageField
                id={`banner-pc-${index}`}
                label="배너 이미지 (PC)"
                onChange={(url) =>
                  onChange(index, { ...banner, imagePath: url })
                }
                preview={banner.imagePath}
              />
              <SingleImageField
                id={`banner-mobile-${index}`}
                label="배너 이미지 (모바일)"
                onChange={(url) =>
                  onChange(index, { ...banner, mobileImagePath: url })
                }
                preview={banner.mobileImagePath}
              />
            </div>
            <div className="mt-4">
              <FieldLabel>링크 URL</FieldLabel>
              <Input
                className={FORM_INPUT_CLASS}
                onChange={(event) =>
                  onChange(index, { ...banner, linkUrl: event.target.value })
                }
                placeholder="https://example.com"
                value={banner.linkUrl}
              />
            </div>
            <div className="mt-4">
              <FieldLabel>배너 제목 (다국어)</FieldLabel>
              <div className="space-y-3">
                {LANGUAGE_LIST.map((language) => {
                  const code = getLanguageCode(language.code);
                  return (
                    <div key={`${language.id}-${index + 1}`}>
                      <FieldLabel>
                        {getLanguageLabel(language.id)} 제목
                      </FieldLabel>
                      <Input
                        className={FORM_INPUT_CLASS}
                        onChange={(event) =>
                          onChange(index, {
                            ...banner,
                            titles: {
                              ...banner.titles,
                              [code]: event.target.value,
                            },
                          })
                        }
                        value={banner.titles[code]}
                      />
                    </div>
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
