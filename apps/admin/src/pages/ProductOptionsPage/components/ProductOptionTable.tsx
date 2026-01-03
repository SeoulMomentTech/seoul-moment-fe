import { Edit, Trash2 } from "lucide-react";

import { type AdminProductOptionListItem } from "@shared/services/productOption";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Button,
} from "@seoul-moment/ui";

interface ProductOptionTableProps {
  options: AdminProductOptionListItem[];
  isLoading: boolean;
}

export function ProductOptionTable({
  options,
  isLoading,
}: ProductOptionTableProps) {
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
          <TableHead>ID</TableHead>
          <TableHead>옵션 타입</TableHead>
          <TableHead>옵션 이름</TableHead>
          <TableHead>UI 타입</TableHead>
          <TableHead>등록일</TableHead>
          <TableHead>수정일</TableHead>
          <TableHead>액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {options.length === 0 ? (
          <TableRow>
            <TableCell className="py-12 text-center text-gray-500" colSpan={1}>
              옵션이 없습니다.
            </TableCell>
          </TableRow>
        ) : (
          options.map((option) => (
            <TableRow key={option.id}>
              <TableCell>{option.id}</TableCell>
              <TableCell>{option.type}</TableCell>
              <TableCell>
                {option.nameDto.map((name) => name.name).join(", ")}
              </TableCell>
              <TableCell>{option.uiType}</TableCell>
              <TableCell className="text-sm text-gray-600">
                {option.createDate
                  ? new Date(option.createDate).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {option.updateDate
                  ? new Date(option.updateDate).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell>
                <Button size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
