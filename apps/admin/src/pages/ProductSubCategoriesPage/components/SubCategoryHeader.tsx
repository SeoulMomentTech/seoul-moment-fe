import { Plus } from "lucide-react";

import { Button, HStack } from "@seoul-moment/ui";

interface SubCategoryHeaderProps {
  onClickAdd(): void;
}

export function SubCategoryHeader({ onClickAdd }: SubCategoryHeaderProps) {
  return (
    <HStack align="between" className="mb-8">
      <div>
        <h1 className="mb-2">서브 카테고리 관리</h1>
        <p className="text-gray-600">상품 서브 카테고리를 관리하세요.</p>
      </div>
      <Button onClick={onClickAdd}>
        <Plus className="mr-2 h-4 w-4" />
        서브 카테고리 추가
      </Button>
    </HStack>
  );
}
