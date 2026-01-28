import { useNavigate } from "react-router";

import { Edit, Trash2 } from "lucide-react";

import { PATH } from "@shared/constants/route";
import type { GetAdminProductResponse } from "@shared/services/adminProduct";

import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@seoul-moment/ui";

import { useDeleteAdminProductMutation } from "../hooks/useDeleteAdminProductMutation";

interface ProductMasterTableProps {
  isLoading: boolean;
  products: GetAdminProductResponse[];
}

export const ProductMasterTable = ({
  isLoading,
  products,
}: ProductMasterTableProps) => {
  const navigate = useNavigate();
  const { mutate: deleteProduct } = useDeleteAdminProductMutation();

  const handleDelete = (id: number) => {
    if (confirm("정말로 삭제하시겠습니까?")) {
      deleteProduct(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-20 text-center font-medium text-gray-900">
              ID
            </TableHead>
            <TableHead className="w-[30%] font-medium text-gray-900">
              대주제명
            </TableHead>
            <TableHead className="w-48 font-medium text-gray-900">
              등록일
            </TableHead>
            <TableHead className="w-48 font-medium text-gray-900">
              수정일
            </TableHead>
            <TableHead className="text-right font-medium text-gray-900">
              관리
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell className="h-48 text-center text-gray-500" colSpan={5}>
                등록된 대주제가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="text-center font-medium">
                  {product.id}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {product.nameDto.map((nameItem) => (
                      <span
                        className={`text-sm ${
                          nameItem.languageCode === "ko"
                            ? "font-medium text-gray-900"
                            : nameItem.languageCode === "en"
                              ? "text-gray-600"
                              : "text-gray-400"
                        }`}
                        key={nameItem.languageCode}
                      >
                        {nameItem.name}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  {new Date(product.createDate).toLocaleString()}
                </TableCell>
                <TableCell className="text-gray-600">
                  {new Date(product.updateDate).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() =>
                        navigate(
                          PATH.PRODUCT_MASTER_EDIT.replace(
                            ":id",
                            product.id.toString(),
                          ),
                        )
                      }
                      size="sm"
                      variant="outline"
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      수정
                    </Button>
                    <Button
                      onClick={() => handleDelete(product.id)}
                      size="sm"
                      variant="outline"
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      삭제
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
