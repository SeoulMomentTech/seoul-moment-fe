import { useMemo, useState, type KeyboardEvent } from "react";

import { Pagination } from "@shared/components/pagination";
import type {
  AdminProductCategoryListItem,
  ProductCategoryId,
} from "@shared/services/productCategory";

import {
  SubCategoryCreateModal,
  SubCategoryEditModal,
  SubCategoryFilters,
  SubCategoryHeader,
  SubCategoryTable,
} from "./components";
import {
  useAdminProductCategoryListQuery,
  useCreateAdminProductCategoryMutation,
  useDeleteAdminProductCategoryMutation,
  useUpdateAdminProductCategoryMutation,
} from "./hooks";
import {
  EMPTY_SUBCATEGORY_FORM,
  toNamePayload,
  toSubCategoryFormValues,
  type SubCategoryFormValues,
} from "./utils";

export default function ProductSubcategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] =
    useState<AdminProductCategoryListItem | null>(null);

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

  const { mutateAsync: updateSubcategory, isPending: isUpdating } =
    useUpdateAdminProductCategoryMutation();

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleSearchKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAddSubcategory = async (values: SubCategoryFormValues) => {
    if (!values.categoryId) return;
    try {
      await createSubcategory({
        list: toNamePayload(values),
        categoryId: Number(values.categoryId),
        imageUrl: values.imageUrl.trim(),
      });
      setIsModalOpen(false);
      setPage(1);
    } catch (error) {
      console.error("서브카테고리 추가 오류:", error);
      alert("서브카테고리를 추가하는 중 오류가 발생했습니다.");
    }
  };

  const resetEditState = () => {
    setIsEditModalOpen(false);
    setEditingSubcategory(null);
  };

  const openEditModal = (subcategory: AdminProductCategoryListItem) => {
    setEditingSubcategory(subcategory);
    setIsEditModalOpen(true);
  };

  const handleUpdateSubcategory = async (values: SubCategoryFormValues) => {
    if (!editingSubcategory || !values.categoryId) return;
    try {
      await updateSubcategory({
        productCategoryId: editingSubcategory.id as ProductCategoryId,
        payload: {
          list: toNamePayload(values),
          categoryId: Number(values.categoryId),
        },
      });
      resetEditState();
      setPage(1);
    } catch (error) {
      console.error("서브카테고리 수정 오류:", error);
      alert("서브카테고리를 수정하는 중 오류가 발생했습니다.");
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
  const editDefaultValues = useMemo(
    () => toSubCategoryFormValues(editingSubcategory),
    [editingSubcategory],
  );

  return (
    <div className="p-8 pt-24">
      <SubCategoryHeader onClickAdd={() => setIsModalOpen(true)} />
      <SubCategoryCreateModal
        defaultValues={EMPTY_SUBCATEGORY_FORM}
        isOpen={isModalOpen}
        isSubmitting={isCreating}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSubcategory}
      />
      <SubCategoryEditModal
        defaultValues={editDefaultValues}
        isOpen={isEditModalOpen}
        isSubmitting={isUpdating}
        onClose={resetEditState}
        onSubmit={handleUpdateSubcategory}
        productCategoryId={editingSubcategory?.id ?? null}
      />

      <div className="mb-6 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600">총 {total}개의 서브 카테고리</p>
        </div>

        <SubCategoryFilters
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

        <SubCategoryTable
          isDeleting={isDeleting}
          isLoading={isListLoading}
          onDelete={handleDeleteSubcategory}
          onEdit={openEditModal}
          subcategories={subcategories}
        />
      </div>

      <Pagination
        countOnPage={subcategories.length}
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
