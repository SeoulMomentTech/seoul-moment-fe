import { useState, type KeyboardEvent } from "react";

import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@seoul-moment/ui";

import { useAdminProductItemListQuery } from "./hooks";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<"ASC" | "DESC">("DESC");
  const { data, isLoading } = useAdminProductItemListQuery({
    page,
    count: pageSize,
    search: searchQuery || undefined,
    sort,
  });

  const products = data?.data.list ?? [];
  const total = data?.data.total ?? 0;

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleSearchKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const toggleSort = () => {
    setSort(sort === "ASC" ? "DESC" : "ASC");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="p-8 pt-24">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2">전체 상품</h1>
          <p className="text-gray-600">등록된 상품을 조회하세요.</p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600">총 {total}개의 상품</p>
        </div>

        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                className="h-[40px] rounded-md bg-white pl-10"
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                placeholder="상품명으로 검색..."
                value={searchInput}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              검색
            </Button>
            <Button onClick={toggleSort} variant="outline">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {sort === "ASC" ? "오름차순" : "내림차순"}
            </Button>
            <Select
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
              value={pageSize.toString()}
            >
              <SelectTrigger className="w-32 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10개씩</SelectItem>
                <SelectItem value="20">20개씩</SelectItem>
                <SelectItem value="50">50개씩</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
          </div>
        ) : (
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
                  <TableCell
                    className="py-12 text-center text-gray-500"
                    colSpan={8}
                  >
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
                    <TableCell>{product.colorCode || "-"}</TableCell>
                    <TableCell>
                      <p>{formatPrice(product.price)}</p>
                    </TableCell>
                    <TableCell>
                      {product.discountPrice
                        ? formatPrice(product.discountPrice)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(product.createDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(product.updateDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <p>현재 페이지: {products.length}개</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            size="sm"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600">
              {page} / {totalPages || 1}
            </span>
          </div>
          <Button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            size="sm"
            variant="outline"
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
