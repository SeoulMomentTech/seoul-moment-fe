import { Link } from "react-router";

import { Edit, Trash2 } from "lucide-react";


import { PATH } from "@shared/constants/route";
import { type AdminProductItem } from "@shared/services/products";

import {
  Button,
  Flex,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@seoul-moment/ui";

import { useDeleteAdminProductItemMutation } from "../hooks";

interface ProductTableProps {
  products: AdminProductItem[];
  isLoading: boolean;
  formatPrice(price: number): string;
}

export const ProductTable = ({
  products,
  isLoading,
  formatPrice,
}: ProductTableProps) => {
  const { mutateAsync: deleteProductItem, isPending } =
    useDeleteAdminProductItemMutation();

  const handleDelete = async (productItemId: AdminProductItem["id"]) => {
    if (!confirm("삭제 하시겠습니까?")) {
      return;
    }

    try {
      await deleteProductItem(productItemId);
    } catch (error) {
      console.error("상품 아이템 삭제 오류:", error);
      alert("상품 아이템을 삭제하는 중 오류가 발생했습니다.");
    }
  };

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
          <TableHead className="w-20 text-center">ID</TableHead>
          <TableHead className="text-center">상품 ID</TableHead>
          <TableHead className="text-center">대표 이미지</TableHead>
          <TableHead>색상 코드</TableHead>
          <TableHead>가격</TableHead>
          <TableHead>할인가</TableHead>
          <TableHead className="text-center">등록일</TableHead>
          <TableHead className="text-center">수정일</TableHead>
          <TableHead className="w-24 text-center">액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 ? (
          <TableRow>
            <TableCell className="py-12 text-center text-gray-500" colSpan={9}>
              상품이 없습니다.
            </TableCell>
          </TableRow>
        ) : (
          products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="text-center">{product.id}</TableCell>
              <TableCell className="text-center">{product.productId}</TableCell>
              <TableCell>
                <Flex align="center" justify="center">
                  {product.imageUrl ? (
                    <img
                      alt={`product-${product.id}`}
                      className="h-12 w-12 rounded-lg object-cover"
                      src={product.imageUrl}
                    />
                  ) : (
                    "-"
                  )}
                </Flex>
              </TableCell>
              <TableCell>
                {product.colorCode ? (
                  <Flex align="center" className="text-sm" gap={4}>
                    <div
                      className="aspect-square w-[20px] rounded-full border border-black/30"
                      style={{
                        background: product.colorCode,
                      }}
                    />
                    {product.colorCode}
                  </Flex>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <p>{formatPrice(product.price)}</p>
              </TableCell>
              <TableCell>
                {product.discountPrice
                  ? formatPrice(product.discountPrice)
                  : "-"}
              </TableCell>
              <TableCell className="text-sm text-gray-600 text-center">
                {product.createDate
                  ? new Date(product.createDate).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell className="text-sm text-gray-600 text-center">
                {product.updateDate
                  ? new Date(product.updateDate).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell>
                <Flex align="center" gap={10} justify="center">
                  <Link
                    aria-label="상품 수정"
                    className="flex items-center justify-center"
                    to={PATH.PRODUCT_EDIT.replace(
                      ":id",
                      String(product.id),
                    )}
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <Button
                    aria-label="상품 삭제"
                    className="px-0"
                    disabled={isPending}
                    onClick={() => handleDelete(product.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </Flex>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table >
  );
};
