import { Plus } from "lucide-react";

import { PageHeader } from "@/shared/components/page-header";

import { Button } from "@seoul-moment/ui";

interface SubCategoryHeaderProps {
  onClickAdd(): void;
}

export function SubCategoryHeader({ onClickAdd }: SubCategoryHeaderProps) {
  return (
    <PageHeader
      right={
        <Button onClick={onClickAdd}>
          <Plus className="mr-2 h-4 w-4" />
          서브 카테고리 추가
        </Button>
      }
    />
  );
}
