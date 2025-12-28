import { type AdminProductItem } from "@shared/services/products";

import {
  Flex,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@seoul-moment/ui";

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
          <TableHead>상품 ID</TableHead>
          <TableHead>대표 이미지</TableHead>
          <TableHead>색상 코드</TableHead>
          <TableHead>가격</TableHead>
          <TableHead>할인가</TableHead>
          <TableHead>등록일</TableHead>
          <TableHead>수정일</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 ? (
          <TableRow>
            <TableCell className="py-12 text-center text-gray-500" colSpan={8}>
              상품이 없습니다.
            </TableCell>
          </TableRow>
        ) : (
          products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.id}</TableCell>
              <TableCell>{product.productId}</TableCell>
              <TableCell>
                {product.imageUrl ? (
                  <img
                    alt={`product-${product.id}`}
                    className="h-12 w-12 rounded-lg object-cover"
                    src={product.imageUrl}
                  />
                ) : (
                  "-"
                )}
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
              <TableCell className="text-sm text-gray-600">
                {product.createDate
                  ? new Date(product.createDate).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {product.updateDate
                  ? new Date(product.updateDate).toLocaleDateString()
                  : "-"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
