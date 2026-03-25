import { Plus, Trash2 } from "lucide-react";

import { MultipleImageUpload } from "@shared/components/multi-image-upload";

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@seoul-moment/ui";

import { SECTION_OPTIONS } from "../../constants/form";
import type {
  BrandPromotionFormErrors,
  SectionFormValue,
  SectionType,
} from "../../types";
import { Card, FieldError, FieldLabel, SectionHeader } from "../FormShare";

interface SectionListSectionProps {
  errors?: BrandPromotionFormErrors["sections"];
  onAdd(): void;
  onChange(index: number, nextValue: SectionFormValue): void;
  onRemove(index: number): void;
  sections: SectionFormValue[];
}




const maxImages = {
  TYPE_1: 1,
  TYPE_2: 2,
  TYPE_3: 4,
  TYPE_4: 1,
  TYPE_5: 1,
}

export function SectionListSection({
  errors,
  onAdd,
  onChange,
  onRemove,
  sections,
}: SectionListSectionProps) {
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
            섹션 추가
          </Button>
        }
        title="섹션 목록"
      />
      <div className="space-y-4">
        {sections.map((section, index) => (
          <Card key={`section-${index + 1}`}>
            <div className="mb-4 flex items-center justify-between">
              <div className="font-semibold">섹션 #{index + 1}</div>
              <button
                className="text-red-500"
                onClick={() => onRemove(index)}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-4">
              <FieldLabel>타입</FieldLabel>
              <Select
                onValueChange={(value) =>
                  onChange(index, { ...section, type: value as SectionType })
                }
                value={section.type}
              >
                <SelectTrigger className="h-[48px] rounded-[10px] border-black/15 bg-white text-left">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {SECTION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <MultipleImageUpload
              folder="brand"
              label="섹션 이미지 (다중 선택)"
              maxImages={maxImages[section.type]}
              onChange={(urls) =>
                onChange(index, { ...section, imagePathList: urls })
              }
              value={section.imagePathList.slice(0, maxImages[section.type]).filter(Boolean)}
            />
            <FieldError message={errors?.[index]?.imagePathList} />
          </Card>
        ))}
      </div>
    </>
  );
}
