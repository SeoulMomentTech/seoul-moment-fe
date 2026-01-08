import { ListOrdered, Plus, Save, X } from "lucide-react";

import { PageHeader } from "@shared/components/page-header";

import { Button, Flex } from "@seoul-moment/ui";

interface ProductBannerHeaderProps {
  isSortEditing: boolean;
  isSavingSort: boolean;
  onAdd(): void;
  onStartSortEdit(): void;
  onCancelSortEdit(): void;
  onSaveSortEdit(): void;
}

export function ProductBannerHeader({
  isSortEditing,
  isSavingSort,
  onAdd,
  onStartSortEdit,
  onCancelSortEdit,
  onSaveSortEdit,
}: ProductBannerHeaderProps) {
  return (
    <PageHeader
      description="상품 페이지에 표시될 배너를 관리하세요."
      right={
        <Flex gap={8}>
          {isSortEditing ? (
            <>
              <Button
                disabled={isSavingSort}
                onClick={onSaveSortEdit}
                variant="default"
              >
                <Save className="mr-2 h-4 w-4" />
                순서 저장
              </Button>
              <Button
                disabled={isSavingSort}
                onClick={onCancelSortEdit}
                variant="outline"
              >
                <X className="mr-2 h-4 w-4" />
                취소
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onStartSortEdit} variant="outline">
                <ListOrdered className="mr-2 h-4 w-4" />
                순서 편집
              </Button>
              <Button onClick={onAdd}>
                <Plus className="mr-2 h-4 w-4" />
                배너 추가
              </Button>
            </>
          )}
        </Flex>
      }
      title="상품 배너 관리"
    />
  );
}
