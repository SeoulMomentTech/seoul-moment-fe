import { useMemo, useState } from "react";

import { PageHeader } from "@shared/components/page-header";
import type {
  AdminNewsCategory,
  AdminNewsCategoryId,
} from "@shared/services/news";

import {
  useAdminNewsCategoryListQuery,
  useDeleteAdminNewsCategoryMutation,
  useUpdateAdminNewsCategoryMutation,
} from "../hooks";
import { NewsCategoryEditModal, NewsCategoryTable } from "./components";
import {
  EMPTY_NAMES,
  toCategoryNamePayload,
  toCategoryNames,
  type CategoryNames,
} from "./utils";

export default function NewsCategoryPage() {
  const [editingCategory, setEditingCategory] =
    useState<AdminNewsCategory | null>(null);

  const {
    data: categoryResponse,
    isLoading,
    isFetching,
  } = useAdminNewsCategoryListQuery();

  const { mutateAsync: updateCategory, isPending: isUpdating } =
    useUpdateAdminNewsCategoryMutation();
  const { mutateAsync: deleteCategory, isPending: isDeleting } =
    useDeleteAdminNewsCategoryMutation();

  const resetEditState = () => {
    setEditingCategory(null);
  };

  const openEditModal = (category: AdminNewsCategory) => {
    setEditingCategory(category);
  };

  const handleUpdateCategory = async (values: CategoryNames) => {
    if (!editingCategory) return;

    try {
      await updateCategory({
        categoryId: editingCategory.id,
        payload: { nameList: toCategoryNamePayload(values) },
      });
      resetEditState();
    } catch (error) {
      console.error("카테고리 수정 오류:", error);
      alert("카테고리를 수정하는 중 오류가 발생했습니다.");
    }
  };

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

  const editDefaultValues = useMemo<CategoryNames>(() => {
    if (!editingCategory) {
      return EMPTY_NAMES;
    }

    return toCategoryNames(editingCategory.nameList);
  }, [editingCategory]);

  const categories = categoryResponse?.data.list ?? [];
  const total = categoryResponse?.data.total ?? 0;
  const isListLoading = isLoading || isFetching;

  return (
    <div className="p-8 pt-24">
      <PageHeader
        description="뉴스 카테고리의 다국어 이름을 조회하고 관리하세요."
        title="카테고리 관리"
      />

      <NewsCategoryEditModal
        defaultValues={editDefaultValues}
        isOpen={editingCategory !== null}
        isSubmitting={isUpdating}
        onClose={resetEditState}
        onSubmit={handleUpdateCategory}
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
