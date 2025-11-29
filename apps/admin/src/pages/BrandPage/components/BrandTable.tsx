import { Edit, Trash2 } from "lucide-react";

import type { AdminBrandListItem } from "@shared/services/brand";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@seoul-moment/ui";

interface BrandTableProps {
  brands: AdminBrandListItem[];
  isLoading: boolean;
  isFetching: boolean;
  hasSearchQuery: boolean;
  onDelete(id: number): void;
}

const getNameByLanguage = (
  brand: AdminBrandListItem,
  languageCode: string,
) =>
  brand.nameDto.find((name) => name.languageCode === languageCode)?.name ?? "";

export function BrandTable({
  brands,
  isLoading,
  isFetching,
  hasSearchQuery,
  onDelete,
}: BrandTableProps) {
  const isListLoading = isLoading || isFetching;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>한국어</TableHead>
          <TableHead>영어</TableHead>
          <TableHead>중국어(번체)</TableHead>
          <TableHead className="text-right">관리</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isListLoading ? (
          <TableRow>
            <TableCell className="py-8 text-center text-gray-500" colSpan={5}>
              브랜드를 불러오는 중입니다.
            </TableCell>
          </TableRow>
        ) : brands.length === 0 ? (
          <TableRow>
            <TableCell className="py-8 text-center text-gray-500" colSpan={5}>
              {hasSearchQuery ? "검색 결과가 없습니다." : "등록된 브랜드가 없습니다."}
            </TableCell>
          </TableRow>
        ) : (
          brands.map((brand) => (
            <TableRow key={brand.id}>
              <TableCell>{brand.id}</TableCell>
              <TableCell>{getNameByLanguage(brand, "ko")}</TableCell>
              <TableCell className="text-gray-600">
                {getNameByLanguage(brand, "en")}
              </TableCell>
              <TableCell>{getNameByLanguage(brand, "zh-TW")}</TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => onDelete(brand.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
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
