import { useState, type KeyboardEvent } from "react";

import { Pagination } from "@shared/components/pagination";
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
import {
  EMPTY_NAMES,
  makeNameChangeHandler,
  toNamePayload,
  type CategoryNames,
} from "./utils";

export default function ProductCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryNames, setNewCategoryNames] =
    useState<CategoryNames>(EMPTY_NAMES);
  const [editCategoryNames, setEditCategoryNames] =
    useState<CategoryNames>(EMPTY_NAMES);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort] = useState<"ASC" | "DESC">("DESC");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(
    null,
  );
  const handleNewNameChange = makeNameChangeHandler(setNewCategoryNames);
  const handleEditNameChange = makeNameChangeHandler(setEditCategoryNames);

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

  const handleAddCategory = async () => {
    if (!newCategoryNames.ko.trim()) {
      alert("카테고리 이름(한국어)을 입력해주세요.");
      return;
    }

    try {
      await createCategory({
        list: toNamePayload(newCategoryNames),
      });
      setNewCategoryNames(EMPTY_NAMES);
      setIsModalOpen(false);
      setPage(1);
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
    setEditCategoryNames(EMPTY_NAMES);
  };

  const openEditModal = (category: AdminCategory) => {
    setEditingCategory(category);
    const getName = (code: string) =>
      category.nameDto.find((n) => n.languageCode === code)?.name ?? "";

    setEditCategoryNames({
      ko: getName("ko"),
      en: getName("en"),
      zh: getName("zh-TW"),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    if (!editCategoryNames.ko.trim()) {
      alert("카테고리 이름(한국어)을 입력해주세요.");
      return;
    }

    try {
      await updateCategory({
        categoryId: editingCategory.id,
        payload: {
          list: toNamePayload(editCategoryNames),
        },
      });
      resetEditState();
      setPage(1);
    } catch (error) {
      console.error("카테고리 수정 오류:", error);
      alert("카테고리를 수정하는 중 오류가 발생했습니다.");
    }
  };

  const categories = categoryResponse?.data.list ?? [];
  const total = categoryResponse?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const isListLoading = isLoading || isFetching;

  return (
    <div className="p-8 pt-24">
      <CategoryHeader onClickAdd={() => setIsModalOpen(true)} />

      <CategoryCreateModal
        isOpen={isModalOpen}
        isSubmitting={isCreating}
        newCategoryNameEn={newCategoryNames.en}
        newCategoryNameKo={newCategoryNames.ko}
        newCategoryNameZh={newCategoryNames.zh}
        onChangeEn={(e) => handleNewNameChange("en")(e.target.value)}
        onChangeKo={(e) => handleNewNameChange("ko")(e.target.value)}
        onChangeZh={(e) => handleNewNameChange("zh")(e.target.value)}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddCategory}
      />

      <CategoryEditModal
        editCategoryNameEn={editCategoryNames.en}
        editCategoryNameKo={editCategoryNames.ko}
        editCategoryNameZh={editCategoryNames.zh}
        isOpen={isEditModalOpen}
        isSubmitting={isUpdating}
        onChangeEn={(e) => handleEditNameChange("en")(e.target.value)}
        onChangeKo={(e) => handleEditNameChange("ko")(e.target.value)}
        onChangeZh={(e) => handleEditNameChange("zh")(e.target.value)}
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
            setPage(1);
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
