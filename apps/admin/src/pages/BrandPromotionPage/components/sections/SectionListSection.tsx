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
import type { SectionFormValue, SectionType } from "../../types";
import { Card, FieldLabel, SectionHeader } from "../FormShare";

interface SectionListSectionProps {
  onAdd(): void;
  onChange(index: number, nextValue: SectionFormValue): void;
  onRemove(index: number): void;
  sections: SectionFormValue[];
}

export function SectionListSection({
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
                <SelectContent>
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
              maxImages={10}
              onChange={(urls) =>
                onChange(index, { ...section, imagePathList: urls })
              }
              value={section.imagePathList.filter(Boolean)}
            />
          </Card>
        ))}
      </div>
    </>
  );
}
