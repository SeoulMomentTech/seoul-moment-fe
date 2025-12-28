import { Plus } from "lucide-react";

import { PageHeader } from "@shared/components/page-header";

import { Button } from "@seoul-moment/ui";

interface CategoryHeaderProps {
  onClickAdd(): void;
}

export function CategoryHeader({ onClickAdd }: CategoryHeaderProps) {
  return (
    <PageHeader
      right={
        <Button onClick={onClickAdd}>
          <Plus className="mr-2 h-4 w-4" />
          카테고리 추가
        </Button>
      }
    />
  );
}
