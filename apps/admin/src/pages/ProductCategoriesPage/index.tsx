import { useState, useEffect } from "react";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Button,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@seoul-moment/ui";

interface NameDto {
  languageCode: string;
  name: string;
}

interface Category {
  id: number;
  nameDto: NameDto[];
}

interface ApiResponse {
  result: boolean;
  data: {
    total: number;
    list: Category[];
  };
}

export default function ProductCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryNameKo, setNewCategoryNameKo] = useState("");
  const [newCategoryNameEn, setNewCategoryNameEn] = useState("");
  const [newCategoryNameZh, setNewCategoryNameZh] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort] = useState<"ASC" | "DESC">("DESC");
  const [isLoading, setIsLoading] = useState(false);

  // Mock 데이터
  const mockApiData: ApiResponse = {
    result: true,
    data: {
      total: 15,
      list: [
        {
          id: 1,
          nameDto: [
            { languageCode: "ko", name: "패션" },
            { languageCode: "en", name: "Fashion" },
            { languageCode: "zh-TW", name: "时尚" },
          ],
        },
        {
          id: 2,
          nameDto: [
            { languageCode: "ko", name: "뷰티" },
            { languageCode: "en", name: "Beauty" },
            { languageCode: "zh-TW", name: "美妆" },
          ],
        },
        {
          id: 3,
          nameDto: [
            { languageCode: "ko", name: "전자기기" },
            { languageCode: "en", name: "Electronics" },
            { languageCode: "zh-TW", name: "电子产品" },
          ],
        },
        {
          id: 4,
          nameDto: [
            { languageCode: "ko", name: "가전제품" },
            { languageCode: "en", name: "Home Appliances" },
            { languageCode: "zh-TW", name: "家电" },
          ],
        },
        {
          id: 5,
          nameDto: [
            { languageCode: "ko", name: "스포츠" },
            { languageCode: "en", name: "Sports" },
            { languageCode: "zh-TW", name: "运动" },
          ],
        },
        {
          id: 6,
          nameDto: [
            { languageCode: "ko", name: "도서" },
            { languageCode: "en", name: "Books" },
            { languageCode: "zh-TW", name: "图书" },
          ],
        },
        {
          id: 7,
          nameDto: [
            { languageCode: "ko", name: "식품" },
            { languageCode: "en", name: "Food" },
            { languageCode: "zh-TW", name: "食品" },
          ],
        },
        {
          id: 8,
          nameDto: [
            { languageCode: "ko", name: "가구" },
            { languageCode: "en", name: "Furniture" },
            { languageCode: "zh-TW", name: "家具" },
          ],
        },
        {
          id: 9,
          nameDto: [
            { languageCode: "ko", name: "완구" },
            { languageCode: "en", name: "Toys" },
            { languageCode: "zh-TW", name: "玩具" },
          ],
        },
        {
          id: 10,
          nameDto: [
            { languageCode: "ko", name: "반려동물" },
            { languageCode: "en", name: "Pet Supplies" },
            { languageCode: "zh-TW", name: "宠物用品" },
          ],
        },
        {
          id: 11,
          nameDto: [
            { languageCode: "ko", name: "자동차용품" },
            { languageCode: "en", name: "Automotive" },
            { languageCode: "zh-TW", name: "汽车用品" },
          ],
        },
        {
          id: 12,
          nameDto: [
            { languageCode: "ko", name: "문구" },
            { languageCode: "en", name: "Stationery" },
            { languageCode: "zh-TW", name: "文具" },
          ],
        },
        {
          id: 13,
          nameDto: [
            { languageCode: "ko", name: "악기" },
            { languageCode: "en", name: "Musical Instruments" },
            { languageCode: "zh-TW", name: "乐器" },
          ],
        },
        {
          id: 14,
          nameDto: [
            { languageCode: "ko", name: "공예품" },
            { languageCode: "en", name: "Crafts" },
            { languageCode: "zh-TW", name: "工艺品" },
          ],
        },
        {
          id: 15,
          nameDto: [
            { languageCode: "ko", name: "원예" },
            { languageCode: "en", name: "Gardening" },
            { languageCode: "zh-TW", name: "园艺" },
          ],
        },
      ],
    },
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      // Mock API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500));

      let filteredList = [...mockApiData.data.list];

      // 검색어 필터링
      if (searchQuery) {
        filteredList = filteredList.filter((category) =>
          category.nameDto.some((name) =>
            name.name.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        );
      }

      // 정렬
      filteredList.sort((a, b) => {
        const aName = getCategoryName(a.nameDto);
        const bName = getCategoryName(b.nameDto);
        return sort === "ASC"
          ? aName.localeCompare(bName, "ko")
          : bName.localeCompare(aName, "ko");
      });

      // 전체 개수
      const total = filteredList.length;

      // 페이지네이션
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedList = filteredList.slice(startIndex, endIndex);

      setCategories(paginatedList);
      setTotal(total);
    } catch (error) {
      console.error("카테고리 조회 오류:", error);
      alert("카테고리를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sort, searchQuery]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1); // 검색 시 첫 페이지로 이동
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getCategoryName = (
    nameDto: NameDto[],
    languageCode: string = "ko",
  ): string => {
    const name = nameDto.find((n) => n.languageCode === languageCode);
    return name ? name.name : nameDto[0]?.name || "";
  };

  const handleAddCategory = () => {
    if (!newCategoryNameKo.trim()) {
      alert("카테고리 이름(한국어)을 입력해주세요.");
      return;
    }

    // 실제 환경에서는 POST API 호출
    alert("카테고리 추가 기능은 API 연동이 필요합니다.");
    setNewCategoryNameKo("");
    setNewCategoryNameEn("");
    setNewCategoryNameZh("");
    setIsModalOpen(false);
  };

  const handleDeleteCategory = (categoryId: number) => {
    if (confirm("정말 이 카테고리를 삭제하시겠습니까?")) {
      // 실제 환경에서는 DELETE API 호출
      alert("카테고리 삭제 기능은 API 연동이 필요합니다.");
    }

    console.log(categoryId);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-8 pt-24">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2">카테고리 관리</h1>
          <p className="text-gray-600">상품 카테고리를 관리하세요.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          카테고리 추가
        </Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2>새 카테고리 추가</h2>
              <button
                className="rounded-sm opacity-70 hover:opacity-100"
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-500">
              새로운 상품 카테고리를 추가합니다.
            </p>
            <div className="mb-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryNameKo">카테고리 이름(한국어)</Label>
                <Input
                  id="categoryNameKo"
                  onChange={(e) => setNewCategoryNameKo(e.target.value)}
                  placeholder="예: 전자기기"
                  value={newCategoryNameKo}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryNameEn">카테고리 이름(영어)</Label>
                <Input
                  id="categoryNameEn"
                  onChange={(e) => setNewCategoryNameEn(e.target.value)}
                  placeholder="예: Electronics"
                  value={newCategoryNameEn}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryNameZh">카테고리 이름(중국어)</Label>
                <Input
                  id="categoryNameZh"
                  onChange={(e) => setNewCategoryNameZh(e.target.value)}
                  placeholder="예: 电子产品"
                  value={newCategoryNameZh}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsModalOpen(false)} variant="outline">
                취소
              </Button>
              <Button onClick={handleAddCategory}>추가</Button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600">총 {total}개의 카테고리</p>
        </div>

        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                className="bg-white pl-10"
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="카테고리명으로 검색..."
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

        {isLoading ? (
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
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-12 text-center text-gray-500"
                    colSpan={5}
                  >
                    카테고리가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.id}</TableCell>
                    <TableCell>
                      {getCategoryName(category.nameDto, "ko")}
                    </TableCell>
                    <TableCell>
                      {getCategoryName(category.nameDto, "en")}
                    </TableCell>
                    <TableCell>
                      {getCategoryName(category.nameDto, "zh-TW")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteCategory(category.id)}
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
          <p>현재 페이지: {categories.length}개</p>
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
