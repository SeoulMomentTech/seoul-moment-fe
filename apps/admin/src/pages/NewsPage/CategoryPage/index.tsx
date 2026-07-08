import { useMemo, useState } from "react";

import { Plus } from "lucide-react";

import { PageHeader } from "@shared/components/page-header";
import type {
  AdminNewsCategory,
  AdminNewsCategoryId,
} from "@shared/services/news";

import { Button } from "@seoul-moment/ui";

import {
  useAdminNewsCategoryListQuery,
  useCreateAdminNewsCategoryMutation,
  useDeleteAdminNewsCategoryMutation,
  useUpdateAdminNewsCategoryMutation,
} from "../hooks";
import { NewsCategoryFormModal, NewsCategoryTable } from "./components";
import {
  EMPTY_NAMES,
  toCategoryNamePayload,
  toCategoryNames,
  type CategoryNames,
} from "./utils";

type CategoryModalMode = "create" | "edit";

export default function NewsCategoryPage() {
  const [modalMode, setModalMode] = useState<CategoryModalMode | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<AdminNewsCategory | null>(null);

  const {
    data: categoryResponse,
    isLoading,
    isFetching,
  } = useAdminNewsCategoryListQuery();

  const { mutateAsync: createCategory, isPending: isCreating } =
    useCreateAdminNewsCategoryMutation();
  const { mutateAsync: updateCategory, isPending: isUpdating } =
    useUpdateAdminNewsCategoryMutation();
  const { mutateAsync: deleteCategory, isPending: isDeleting } =
    useDeleteAdminNewsCategoryMutation();

  const closeModal = () => {
    setModalMode(null);
    setEditingCategory(null);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setModalMode("create");
  };

  const openEditModal = (category: AdminNewsCategory) => {
    setEditingCategory(category);
    setModalMode("edit");
  };

  const handleCreateCategory = async (values: CategoryNames) => {
    try {
      await createCategory({ nameList: toCategoryNamePayload(values) });
      closeModal();
    } catch (error) {
      console.error("카테고리 생성 오류:", error);
      alert("카테고리를 생성하는 중 오류가 발생했습니다.");
    }
  };

  const handleUpdateCategory = async (values: CategoryNames) => {
    if (!editingCategory) return;

    try {
      await updateCategory({
        categoryId: editingCategory.id,
        payload: { nameList: toCategoryNamePayload(values) },
      });
      closeModal();
    } catch (error) {
      console.error("카테고리 수정 오류:", error);
      alert("카테고리를 수정하는 중 오류가 발생했습니다.");
    }
  };

  const handleSubmitCategory = (values: CategoryNames) =>
    modalMode === "create"
      ? handleCreateCategory(values)
      : handleUpdateCategory(values);

  const handleDeleteCategory = async (categoryId: AdminNewsCategoryId) => {
    const confirmed = confirm("정말 이 카테고리를 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await deleteCategory(categoryId);
    } catch (error) {
      console.error("카테고리 삭제 오류:", error);
      alert("카테고리를 삭제하는 중 오류가 발생했습니다.");
    }
  };

  const modalDefaultValues = useMemo<CategoryNames>(() => {
    if (modalMode === "edit" && editingCategory) {
      return toCategoryNames(editingCategory.nameList);
    }

    return EMPTY_NAMES;
  }, [modalMode, editingCategory]);

  const categories = categoryResponse?.data.list ?? [];
  const total = categoryResponse?.data.total ?? 0;
  const isListLoading = isLoading || isFetching;

  return (
    <div className="p-8 pt-24">
      <PageHeader
        description="뉴스 카테고리의 다국어 이름을 조회하고 관리하세요."
        right={
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            카테고리 추가
          </Button>
        }
        title="카테고리 관리"
      />

      <NewsCategoryFormModal
        defaultValues={modalDefaultValues}
        isOpen={modalMode !== null}
        isSubmitting={modalMode === "create" ? isCreating : isUpdating}
        mode={modalMode ?? "edit"}
        onClose={closeModal}
        onSubmit={handleSubmitCategory}
      />

      <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600">총 {total}개의 카테고리</p>
        </div>

        <NewsCategoryTable
          categories={categories}
          isDeleting={isDeleting}
          isLoading={isListLoading}
          onDelete={handleDeleteCategory}
          onEdit={openEditModal}
        />
      </div>
    </div>
  );
}
