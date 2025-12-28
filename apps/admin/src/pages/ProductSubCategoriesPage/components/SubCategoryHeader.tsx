import { Plus } from "lucide-react";

import { PageHeader } from "@/shared/components/page-header";

import { Button } from "@seoul-moment/ui";

interface SubCategoryHeaderProps {
  onClickAdd(): void;
}

export function SubCategoryHeader({ onClickAdd }: SubCategoryHeaderProps) {
  return (
    <PageHeader
      description="서브 카테고리를 관리하세요."
      right={
        <Button onClick={onClickAdd}>
          <Plus className="mr-2 h-4 w-4" />
          서브 카테고리 추가
        </Button>
      }
      title="서브 카테고리 관리"
    />
  );
}
