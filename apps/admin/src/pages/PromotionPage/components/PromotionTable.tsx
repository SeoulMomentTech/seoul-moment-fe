import { useNavigate } from "react-router";

import { PATH } from "@shared/constants/route";
import type { GetAdminPromotionResponse } from "@shared/services/promotion";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@seoul-moment/ui";

interface PromotionTableProps {
  promotions: GetAdminPromotionResponse[];
  isLoading: boolean;
  isDeleting: boolean;
  onDelete(id: number): void;
}

export function PromotionTable({
  promotions,
  isLoading,
  isDeleting,
  onDelete,
}: PromotionTableProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">로딩 중...</div>;
  }

  if (promotions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        등록된 프로모션이 없습니다.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20 text-center">ID</TableHead>
          <TableHead>프로모션명</TableHead>
          <TableHead className="text-center">상태</TableHead>
          <TableHead className="text-center">기간</TableHead>
          <TableHead className="w-24 text-center">관리</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {promotions.map((promotion) => (
          <TableRow
            className="cursor-pointer hover:bg-gray-50"
            key={promotion.id}
            onClick={() =>
              navigate(PATH.PROMOTION_EDIT.replace(":id", promotion.id.toString()))
            }
          >
            <TableCell className="text-center">{promotion.id}</TableCell>
            <TableCell>
              <div className="font-medium text-gray-900">
                {promotion.language?.[0]?.title || "제목 없음"}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${promotion.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                  }`}
              >
                {promotion.isActive ? "활성" : "비활성"}
              </span>
            </TableCell>
            <TableCell className="text-center text-sm text-gray-500">
              {new Date(promotion.startDate).toLocaleDateString("ko-KR", { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\.$/, '')} ~{" "}
              {new Date(promotion.endDate).toLocaleDateString("ko-KR", { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\.$/, '')}
            </TableCell>
            <TableCell className="text-center">
              <Button
                disabled={isDeleting}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(promotion.id);
                }}
                size="sm"
                variant="outline"
              >
                삭제
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}