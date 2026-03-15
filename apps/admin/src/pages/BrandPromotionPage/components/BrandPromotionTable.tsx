import { Link } from "react-router";

import { Edit, Trash2 } from "lucide-react";

import type { GetAdminBrandPromotionResponse } from "@shared/services/brandPromotion";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@seoul-moment/ui";

interface BrandPromotionTableProps {
  promotions: GetAdminBrandPromotionResponse[];
  isLoading: boolean;
  isFetching: boolean;
  hasSearchQuery: boolean;
  onDelete(id: number): void;
}

export function BrandPromotionTable({
  promotions,
  isLoading,
  isFetching,
  hasSearchQuery,
  onDelete,
}: BrandPromotionTableProps) {
  const isListLoading = isLoading || isFetching;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Promotion ID</TableHead>
          <TableHead>Brand ID</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>생성일</TableHead>
          <TableHead>수정일</TableHead>
          <TableHead className="text-right">관리</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isListLoading ? (
          <TableRow>
            <TableCell className="py-8 text-center text-gray-500" colSpan={6}>
              이벤트를 불러오는 중입니다.
            </TableCell>
          </TableRow>
        ) : promotions.length === 0 ? (
          <TableRow>
            <TableCell className="py-8 text-center text-gray-500" colSpan={6}>
              {hasSearchQuery
                ? "검색 결과가 없습니다."
                : "등록된 이벤트가 없습니다."}
            </TableCell>
          </TableRow>
        ) : (
          promotions.map((promotion) => (
            <TableRow key={promotion.id}>
              <TableCell>{promotion.id}</TableCell>
              <TableCell>{promotion.brandId}</TableCell>
              <TableCell>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    promotion.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {promotion.isActive ? "활성" : "비활성"}
                </span>
              </TableCell>
              <TableCell className="text-gray-600">
                {new Date(promotion.createDate).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-gray-600">
                {new Date(promotion.updateDate).toLocaleDateString()}
              </TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    className="flex items-center justify-center"
                    to={`/brand/promotion/edit/${promotion.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <Button
                    onClick={() => onDelete(promotion.id)}
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
