import { useEffect, useState, type KeyboardEvent } from "react";

import type { ProductCategoryId } from "@shared/services/productCategory";

import {
  SubCategoryCreateModal,
  SubCategoryEditModal,
  SubCategoryFilters,
  SubCategoryHeader,
  SubCategoryPagination,
  SubCategoryTable,
} from "./components";
import {
  useAdminProductCategoryListQuery,
  useCreateAdminProductCategoryMutation,
  useDeleteAdminProductCategoryMutation,
  useAdminProductCategoryQuery,
  useUpdateAdminProductCategoryMutation,
} from "./hooks";

export default function ProductSubcategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newSubcategoryNameKo, setNewSubcategoryNameKo] = useState("");
  const [newSubcategoryNameEn, setNewSubcategoryNameEn] = useState("");
  const [newSubcategoryNameZh, setNewSubcategoryNameZh] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newCategoryId, setNewCategoryId] = useState<number | "">("");
  const [editSubcategoryNameKo, setEditSubcategoryNameKo] = useState("");
  const [editSubcategoryNameEn, setEditSubcategoryNameEn] = useState("");
  const [editSubcategoryNameZh, setEditSubcategoryNameZh] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<number | "">("");
  const [editingSubcategoryId, setEditingSubcategoryId] =
    useState<ProductCategoryId | null>(null);
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

  const { data: editSubcategoryDetail, isFetching: isFetchingDetail } =
    useAdminProductCategoryQuery(editingSubcategoryId ?? 0, {
      enabled: Boolean(editingSubcategoryId),
    });

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleSearchKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const toNamePayload = (ko: string, en: string, zh: string) =>
    [
      { code: "ko", value: ko },
      { code: "en", value: en },
      { code: "zh-TW", value: zh },
    ]
      .filter(({ value }) => value.trim())
      .map(({ code, value }) => ({
        languageId: code === "ko" ? 1 : code === "en" ? 2 : 3,
        name: value.trim(),
      }));

  useEffect(() => {
    if (!editSubcategoryDetail) return;

    const nameMap = new Map(
      editSubcategoryDetail.data.list.map((item) => [
        item.languageId,
        item.name,
      ]),
    );

    setEditSubcategoryNameKo(nameMap.get(1) ?? "");
    setEditSubcategoryNameEn(nameMap.get(2) ?? "");
    setEditSubcategoryNameZh(nameMap.get(3) ?? "");
    setEditCategoryId(editSubcategoryDetail.data.categoryId);
    setEditImageUrl(editSubcategoryDetail.data.imageUrl);
  }, [editSubcategoryDetail]);

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
        list: toNamePayload(
          newSubcategoryNameKo,
          newSubcategoryNameEn,
          newSubcategoryNameZh,
        ),
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

  const resetEditState = () => {
    setIsEditModalOpen(false);
    setEditingSubcategoryId(null);
    setEditSubcategoryNameKo("");
    setEditSubcategoryNameEn("");
    setEditSubcategoryNameZh("");
    setEditImageUrl("");
    setEditCategoryId("");
  };

  const openEditModal = (subcategoryId: ProductCategoryId) => {
    setEditingSubcategoryId(subcategoryId);
    setIsEditModalOpen(true);
  };

  const handleUpdateSubcategory = async () => {
    if (!editingSubcategoryId) return;

    if (!editSubcategoryNameKo.trim()) {
      alert("서브카테고리 이름(한국어)을 입력해주세요.");
      return;
    }

    if (!editCategoryId) {
      alert("상위 카테고리 ID를 입력해주세요.");
      return;
    }

    if (!editImageUrl.trim()) {
      alert("이미지 URL을 입력해주세요.");
      return;
    }

    try {
      await updateSubcategory({
        productCategoryId: editingSubcategoryId,
        payload: {
          list: toNamePayload(
            editSubcategoryNameKo,
            editSubcategoryNameEn,
            editSubcategoryNameZh,
          ),
          categoryId: Number(editCategoryId),
          imageUrl: editImageUrl.trim(),
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

  return (
    <div className="p-8 pt-24">
      <SubCategoryHeader onClickAdd={() => setIsModalOpen(true)} />
      <SubCategoryCreateModal
        isOpen={isModalOpen}
        isSubmitting={isCreating}
        newCategoryId={newCategoryId}
        newImageUrl={newImageUrl}
        newSubcategoryNameEn={newSubcategoryNameEn}
        newSubcategoryNameKo={newSubcategoryNameKo}
        newSubcategoryNameZh={newSubcategoryNameZh}
        onChangeCategoryId={setNewCategoryId}
        onChangeEn={setNewSubcategoryNameEn}
        onChangeImageUrl={setNewImageUrl}
        onChangeKo={setNewSubcategoryNameKo}
        onChangeZh={setNewSubcategoryNameZh}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSubcategory}
      />
      <SubCategoryEditModal
        editCategoryId={editCategoryId}
        editImageUrl={editImageUrl}
        editSubcategoryNameEn={editSubcategoryNameEn}
        editSubcategoryNameKo={editSubcategoryNameKo}
        editSubcategoryNameZh={editSubcategoryNameZh}
        isLoading={isFetchingDetail}
        isOpen={isEditModalOpen}
        isSubmitting={isUpdating}
        onChangeCategoryId={setEditCategoryId}
        onChangeEn={setEditSubcategoryNameEn}
        onChangeImageUrl={setEditImageUrl}
        onChangeKo={setEditSubcategoryNameKo}
        onChangeZh={setEditSubcategoryNameZh}
        onClose={resetEditState}
        onSubmit={handleUpdateSubcategory}
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

      <SubCategoryPagination
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
