import { Edit, Trash2 } from "lucide-react";

import type {
  AdminProductCategoryListItem,
  AdminProductCategoryName,
  ProductCategoryId,
} from "@shared/services/productCategory";

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

interface SubCategoryTableProps {
  subcategories: AdminProductCategoryListItem[];
  isLoading: boolean;
  isDeleting: boolean;
  onEdit(subcategoryId: ProductCategoryId): void;
  onDelete(subcategoryId: ProductCategoryId): void;
}

const getCategoryName = (
  nameDto: AdminProductCategoryName[],
  languageCode: string = "ko",
): string => {
  const name = nameDto.find((n) => n.languageCode === languageCode);
  return name ? name.name : nameDto[0]?.name || "";
};

export function SubCategoryTable({
  subcategories,
  isLoading,
  isDeleting,
  onEdit,
  onDelete,
}: SubCategoryTableProps) {
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
        {subcategories.length === 0 ? (
          <TableRow>
            <TableCell className="py-12 text-center text-gray-500" colSpan={5}>
              서브 카테고리가 없습니다.
            </TableCell>
          </TableRow>
        ) : (
          subcategories.map((subcategory) => (
            <TableRow key={subcategory.id}>
              <TableCell>{subcategory.id}</TableCell>
              <TableCell>{getCategoryName(subcategory.nameDto, "ko")}</TableCell>
              <TableCell>{getCategoryName(subcategory.nameDto, "en")}</TableCell>
              <TableCell>
                {getCategoryName(subcategory.nameDto, "zh-TW")}
              </TableCell>
              <TableCell>
                <Flex gap={8}>
                  <Button onClick={() => onEdit(subcategory.id)} size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    disabled={isDeleting}
                    onClick={() => onDelete(subcategory.id)}
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
