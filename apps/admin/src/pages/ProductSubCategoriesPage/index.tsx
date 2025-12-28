import { useState, type KeyboardEvent } from "react";

import {
  Search,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import type {
  AdminProductCategoryListItem,
  ProductCategoryId,
} from "@shared/services/productCategory";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
} from "@seoul-moment/ui";

import { SubCategoryHeader } from "./components/SubCategoryHeader";
import {
  useAdminProductCategoryListQuery,
  useCreateAdminProductCategoryMutation,
  useDeleteAdminProductCategoryMutation,
} from "./hooks";

export default function ProductSubcategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubcategoryNameKo, setNewSubcategoryNameKo] = useState("");
  const [newSubcategoryNameEn, setNewSubcategoryNameEn] = useState("");
  const [newSubcategoryNameZh, setNewSubcategoryNameZh] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newCategoryId, setNewCategoryId] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort] = useState<"ASC" | "DESC">("DESC");

  const {
    data: subcategoryResponse,
    isLoading,
    isFetching,
  } = useAdminProductCategoryListQuery({
    page,
    count: pageSize,
    search: searchQuery || undefined,
    sort,
  });

  const { mutateAsync: createSubcategory, isPending: isCreating } =
    useCreateAdminProductCategoryMutation();

  const { mutateAsync: deleteSubcategory, isPending: isDeleting } =
    useDeleteAdminProductCategoryMutation();

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleSearchKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getCategoryName = (
    nameDto: AdminProductCategoryListItem["nameDto"],
    languageCode: string = "ko",
  ) => {
    const name = nameDto.find((n) => n.languageCode === languageCode);
    return name ? name.name : (nameDto[0]?.name ?? "");
  };

  const toNamePayload = () =>
    [
      { code: "ko", value: newSubcategoryNameKo },
      { code: "en", value: newSubcategoryNameEn },
      { code: "zh-TW", value: newSubcategoryNameZh },
    ]
      .filter(({ value }) => value.trim())
      .map(({ code, value }) => ({
        languageId: code === "ko" ? 1 : code === "en" ? 2 : 3,
        name: value.trim(),
      }));

  const handleAddSubcategory = async () => {
    if (!newSubcategoryNameKo.trim()) {
      alert("서브카테고리 이름(한국어)을 입력해주세요.");
      return;
    }

    if (!newCategoryId) {
      alert("상위 카테고리 ID를 입력해주세요.");
      return;
    }

    if (!newImageUrl.trim()) {
      alert("이미지 URL을 입력해주세요.");
      return;
    }

    try {
      await createSubcategory({
        list: toNamePayload(),
        categoryId: Number(newCategoryId),
        imageUrl: newImageUrl.trim(),
      });
      setNewSubcategoryNameKo("");
      setNewSubcategoryNameEn("");
      setNewSubcategoryNameZh("");
      setNewImageUrl("");
      setNewCategoryId("");
      setIsModalOpen(false);
      setPage(1);
    } catch (error) {
      console.error("서브카테고리 추가 오류:", error);
      alert("서브카테고리를 추가하는 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: ProductCategoryId) => {
    const confirmed = confirm("정말 이 서브카테고리를 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await deleteSubcategory(subcategoryId, {
        onSuccess: () => {
          setPage(1);
        },
      });
    } catch (error) {
      console.error("서브카테고리 삭제 오류:", error);
      alert("서브카테고리를 삭제하는 중 오류가 발생했습니다.");
    }
  };

  const subcategories = subcategoryResponse?.data.list ?? [];
  const total = subcategoryResponse?.data.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);
  const isListLoading = isLoading || isFetching;

  return (
    <div className="p-8 pt-24">
      <SubCategoryHeader onClickAdd={() => setIsModalOpen(true)} />
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2>새 서브 카테고리 추가</h2>
              <Button
                className="rounded-sm opacity-70 hover:opacity-100"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="mb-4 text-sm text-gray-500">
              새로운 상품 서브 카테고리를 추가합니다.
            </p>
            <div className="mb-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subcategoryNameKo">
                  서브 카테고리 이름(한국어) *
                </Label>
                <Input
                  id="subcategoryNameKo"
                  onChange={(e) => setNewSubcategoryNameKo(e.target.value)}
                  placeholder="예: 남성의류"
                  value={newSubcategoryNameKo}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategoryNameEn">
                  서브 카테고리 이름(영어)
                </Label>
                <Input
                  id="subcategoryNameEn"
                  onChange={(e) => setNewSubcategoryNameEn(e.target.value)}
                  placeholder="예: Men's Clothing"
                  value={newSubcategoryNameEn}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategoryNameZh">
                  서브 카테고리 이름(중국어)
                </Label>
                <Input
                  id="subcategoryNameZh"
                  onChange={(e) => setNewSubcategoryNameZh(e.target.value)}
                  placeholder="예: 男装"
                  value={newSubcategoryNameZh}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentCategoryId">상위 카테고리 ID *</Label>
                <Input
                  id="parentCategoryId"
                  inputMode="numeric"
                  onChange={(e) =>
                    setNewCategoryId(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                  placeholder="예: 1"
                  value={newCategoryId}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategoryImageUrl">이미지 URL *</Label>
                <Input
                  id="subcategoryImageUrl"
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="예: https://example.com/image.png"
                  value={newImageUrl}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsModalOpen(false)} variant="outline">
                취소
              </Button>
              <Button disabled={isCreating} onClick={handleAddSubcategory}>
                {isCreating ? "추가 중..." : "추가"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600">총 {total}개의 서브 카테고리</p>
        </div>

        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                className="bg-white pl-10"
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="서브카테고리명으로 검색..."
                value={searchInput}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              검색
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

        {isListLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
          </div>
        ) : (
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
                  <TableCell
                    className="py-12 text-center text-gray-500"
                    colSpan={5}
                  >
                    서브 카테고리가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                subcategories.map((subcategory) => (
                  <TableRow key={subcategory.id}>
                    <TableCell>{subcategory.id}</TableCell>
                    <TableCell>
                      {getCategoryName(subcategory.nameDto, "ko")}
                    </TableCell>
                    <TableCell>
                      {getCategoryName(subcategory.nameDto, "en")}
                    </TableCell>
                    <TableCell>
                      {getCategoryName(subcategory.nameDto, "zh-TW")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          disabled={isDeleting}
                          onClick={() =>
                            handleDeleteSubcategory(subcategory.id)
                          }
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
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <p>현재 페이지: {subcategories.length}개</p>
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
