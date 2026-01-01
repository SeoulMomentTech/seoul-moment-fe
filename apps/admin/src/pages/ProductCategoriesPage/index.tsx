import { useMemo, useState, type KeyboardEvent } from "react";

import { Pagination } from "@shared/components/pagination";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@shared/constants/page";
import type { AdminCategory, CategoryId } from "@shared/services/category";

import {
  CategoryCreateModal,
  CategoryEditModal,
  CategoryFilters,
  CategoryHeader,
  CategoryTable,
} from "./components";
import {
  useAdminCategoryListQuery,
  useCreateAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
} from "./hooks";
import { EMPTY_NAMES, toNamePayload, type CategoryNames } from "./utils";

export default function ProductCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sort] = useState<"ASC" | "DESC">("DESC");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(
    null,
  );

  const {
    data: categoryResponse,
    isLoading,
    isFetching,
  } = useAdminCategoryListQuery({
    page,
    count: pageSize,
    search: searchQuery || undefined,
    sort,
    searchColumn: "name",
  });

  const { mutateAsync: createCategory, isPending: isCreating } =
    useCreateAdminCategoryMutation();

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1); // 검색 시 첫 페이지로 이동
  };

  const handleSearchKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAddCategory = async (value: CategoryNames["ko"]) => {
    try {
      await createCategory({
        name: value,
      });
      setIsModalOpen(false);
      setPage(DEFAULT_PAGE);
    } catch (error) {
      console.error("카테고리 추가 오류:", error);
      alert("카테고리를 추가하는 중 오류가 발생했습니다.");
    }
  };

  const { mutateAsync: deleteCategory, isPending: isDeleting } =
    useDeleteAdminCategoryMutation();
  const { mutateAsync: updateCategory, isPending: isUpdating } =
    useUpdateAdminCategoryMutation();

  const handleDeleteCategory = async (categoryId: CategoryId) => {
    const confirmed = confirm("정말 이 카테고리를 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await deleteCategory(categoryId, {
        onSuccess: () => {
          setPage(1);
        },
      });
    } catch (error) {
      console.error("카테고리 삭제 오류:", error);
      alert("카테고리를 삭제하는 중 오류가 발생했습니다.");
    }
  };

  const resetEditState = () => {
    setIsEditModalOpen(false);
    setEditingCategory(null);
  };

  const openEditModal = (category: AdminCategory) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = async (values: CategoryNames) => {
    if (!editingCategory) return;

    try {
      await updateCategory({
        categoryId: editingCategory.id,
        payload: {
          list: toNamePayload(values),
        },
      });
      resetEditState();
      setPage(1);
    } catch (error) {
      console.error("카테고리 수정 오류:", error);
      alert("카테고리를 수정하는 중 오류가 발생했습니다.");
    }
  };

  const editDefaultValues = useMemo<CategoryNames>(() => {
    if (!editingCategory) {
      return EMPTY_NAMES;
    }

    const getName = (code: string) =>
      editingCategory.nameDto.find((n) => n.languageCode === code)?.name ?? "";

    return {
      ko: getName("ko"),
      en: getName("en"),
      zh: getName("zh-TW"),
    };
  }, [editingCategory]);

  const categories = categoryResponse?.data.list ?? [];
  const total = categoryResponse?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const isListLoading = isLoading || isFetching;

  return (
    <div className="p-8 pt-24">
      <CategoryHeader onClickAdd={() => setIsModalOpen(true)} />

      <CategoryCreateModal
        defaultValues={{ ko: EMPTY_NAMES["ko"] }}
        isOpen={isModalOpen}
        isSubmitting={isCreating}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddCategory}
      />

      <CategoryEditModal
        defaultValues={editDefaultValues}
        isOpen={isEditModalOpen}
        isSubmitting={isUpdating}
        onClose={resetEditState}
        onSubmit={handleUpdateCategory}
      />

      <div className="mb-6 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600">총 {total}개의 카테고리</p>
        </div>

        <CategoryFilters
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPage(DEFAULT_PAGE);
          }}
          onSearch={handleSearch}
          onSearchInputChange={(value) => setSearchInput(value)}
          onSearchKeyPress={handleSearchKeyPress}
          pageSize={pageSize}
          searchInput={searchInput}
        />

        <CategoryTable
          categories={categories}
          isDeleting={isDeleting}
          isLoading={isListLoading}
          onDelete={handleDeleteCategory}
          onEdit={openEditModal}
        />
      </div>

      <Pagination
        countOnPage={categories.length}
        disableNext={page >= totalPages}
        disablePrev={page === 1}
        onNext={() => {
          setPage((current) => (current >= totalPages ? current : current + 1));
        }}
        onPrev={() => {
          setPage((current) => Math.max(1, current - 1));
        }}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
