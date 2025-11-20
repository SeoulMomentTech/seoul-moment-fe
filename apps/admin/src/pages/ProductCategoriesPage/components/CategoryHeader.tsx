import { Plus } from "lucide-react";

import { Button } from "@seoul-moment/ui";

interface CategoryHeaderProps {
  onClickAdd(): void;
}

export function CategoryHeader({ onClickAdd }: CategoryHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="mb-2">카테고리 관리</h1>
        <p className="text-gray-600">상품 카테고리를 관리하세요.</p>
      </div>
      <Button onClick={onClickAdd}>
        <Plus className="mr-2 h-4 w-4" />
        카테고리 추가
      </Button>
    </div>
  );
}
