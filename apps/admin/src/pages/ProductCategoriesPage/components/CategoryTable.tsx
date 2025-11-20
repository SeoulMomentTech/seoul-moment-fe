import { Edit, Trash2 } from "lucide-react";

import type {
  AdminCategory,
  AdminCategoryName,
  CategoryId,
} from "@shared/services/category";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@seoul-moment/ui";

interface CategoryTableProps {
  categories: AdminCategory[];
  isLoading: boolean;
  isDeleting: boolean;
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
  onDelete,
}: CategoryTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
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
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    disabled={isDeleting}
                    onClick={() => onDelete(category.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
