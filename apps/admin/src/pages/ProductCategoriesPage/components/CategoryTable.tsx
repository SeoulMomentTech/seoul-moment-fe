import { Edit, Trash2 } from "lucide-react";

import type {
  AdminCategory,
  AdminCategoryName,
  CategoryId,
} from "@shared/services/category";

import {
  Button,
  Flex,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  VStack,
} from "@seoul-moment/ui";

interface CategoryTableProps {
  categories: AdminCategory[];
  isLoading: boolean;
  isDeleting: boolean;
  onEdit(category: AdminCategory): void;
  onDelete(categoryId: CategoryId): void;
}

const getCategoryName = (
  nameDto: AdminCategoryName[],
  languageCode: string = "ko",
): string => {
  const name = nameDto.find((n) => n.languageCode === languageCode);
  return name ? name.name : nameDto[0]?.name || "";
};

export function CategoryTable({
  categories,
  isLoading,
  isDeleting,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  if (isLoading) {
    return (
      <VStack align="center" className="p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </VStack>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">ID</TableHead>
          <TableHead>한국어</TableHead>
          <TableHead>영어</TableHead>
          <TableHead>중국어(번체)</TableHead>
          <TableHead className="w-24">액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.length === 0 ? (
          <TableRow>
            <TableCell className="py-12 text-center text-gray-500" colSpan={5}>
              카테고리가 없습니다.
            </TableCell>
          </TableRow>
        ) : (
          categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>{category.id}</TableCell>
              <TableCell>{getCategoryName(category.nameDto, "ko")}</TableCell>
              <TableCell>{getCategoryName(category.nameDto, "en")}</TableCell>
              <TableCell>
                {getCategoryName(category.nameDto, "zh-TW")}
              </TableCell>
              <TableCell>
                <Flex gap={8}>
                  <Button
                    aria-label="수정"
                    onClick={() => onEdit(category)}
                    size="sm"
                    variant="ghost"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    aria-label="삭제"
                    disabled={isDeleting}
                    onClick={() => onDelete(category.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Flex>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
