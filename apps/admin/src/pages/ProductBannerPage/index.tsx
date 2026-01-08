import { useEffect, useMemo, useState, type KeyboardEvent } from "react";

import { Pagination } from "@shared/components/pagination";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
} from "@shared/constants/page";
import type {
  AdminProductBannerListItem,
  ProductBannerId,
} from "@shared/services/productBanner";

import {
  ProductBannerFilters,
  ProductBannerHeader,
  ProductBannerModal,
  ProductBannerTable,
} from "./components";
import {
  useAdminProductBannerListQuery,
  useCreateAdminProductBannerMutation,
  useDeleteAdminProductBannerMutation,
  useUpdateAdminProductBannerMutation,
  useUpdateAdminProductBannerSortOrderMutation,
} from "./hooks";

export function ProductBannerPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] =
    useState<AdminProductBannerListItem | null>(null);
  const [isSortEditing, setIsSortEditing] = useState(false);
  const [orderedIds, setOrderedIds] = useState<ProductBannerId[]>([]);

  const {
    data: bannerResponse,
    isLoading,
    isFetching,
  } = useAdminProductBannerListQuery({
    page,
    count: pageSize,
    sort: DEFAULT_SORT,
  });

  const { mutateAsync: createBanner, isPending: isCreating } =
    useCreateAdminProductBannerMutation();
  const { mutateAsync: updateBanner, isPending: isUpdating } =
    useUpdateAdminProductBannerMutation();
  const { mutateAsync: deleteBanner } = useDeleteAdminProductBannerMutation();
  const { mutateAsync: updateSortOrder, isPending: isUpdatingSort } =
    useUpdateAdminProductBannerSortOrderMutation();

  const banners = useMemo(
    () => bannerResponse?.data?.list ?? [],
    [bannerResponse?.data?.list],
  );
  const total = bannerResponse?.data.total ?? 0;

  const filteredBanners = useMemo(() => {
    if (!searchQuery) return banners;

    const query = searchQuery.toLowerCase();
    return banners.filter((banner) => {
      const haystack = `${banner.id} ${banner.imageUrl}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [banners, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setIsSortEditing(false);
    setOrderedIds([]);
  }, [page, bannerResponse?.data.list]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(DEFAULT_PAGE);
  };

  const handleSearchKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const openCreateModal = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: AdminProductBannerListItem) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  const handleSaveBanner = async (payload: { imageUrl: string }) => {
    if (editingBanner) {
      await updateBanner({
        productBannerId: editingBanner.id,
        payload: {
          imageUrl: payload.imageUrl,
        },
      });
      alert("배너가 수정되었습니다.");
      return;
    }

    await createBanner({ imageUrl: payload.imageUrl });
    alert("배너가 등록되었습니다.");
  };

  const handleDeleteBanner = async (bannerId: ProductBannerId) => {
    const confirmed = confirm("정말 배너를 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await deleteBanner(bannerId);
      alert("배너가 삭제되었습니다.");
    } catch (error) {
      console.error("배너 삭제 오류:", error);
      alert("배너 삭제 중 오류가 발생했습니다.");
    }
  };

  const startSortEdit = () => {
    setIsSortEditing(true);
    setOrderedIds(banners.map((banner) => banner.id));
  };

  const cancelSortEdit = () => {
    setIsSortEditing(false);
    setOrderedIds([]);
  };

  const handleReorder = (
    dragId: ProductBannerId,
    targetId: ProductBannerId,
  ) => {
    setOrderedIds((prev) => {
      const current = prev.length ? [...prev] : banners.map((b) => b.id);
      const fromIndex = current.indexOf(dragId);
      const toIndex = current.indexOf(targetId);
      if (fromIndex === -1 || toIndex === -1) return current;
      current.splice(fromIndex, 1);
      current.splice(toIndex, 0, dragId);
      return current;
    });
  };

  const handleSaveSortEdit = async () => {
    const orderSource = orderedIds.length
      ? orderedIds
      : banners.map((banner) => banner.id);
    try {
      await updateSortOrder({
        list: orderSource.map((bannerId, index) => ({
          id: bannerId,
          sortOrder: index + 1,
        })),
      });
      setIsSortEditing(false);
      setOrderedIds([]);
      alert("배너 순서가 변경되었습니다.");
    } catch (error) {
      console.error("배너 순서 변경 오류:", error);
      alert("배너 순서 변경 중 오류가 발생했습니다.");
    }
  };

  const displayBanners = useMemo(() => {
    if (!isSortEditing) {
      return filteredBanners;
    }

    if (!orderedIds.length) {
      return banners;
    }

    const bannerMap = new Map(banners.map((banner) => [banner.id, banner]));
    return orderedIds
      .map((id) => bannerMap.get(id))
      .filter((banner): banner is AdminProductBannerListItem =>
        Boolean(banner),
      );
  }, [banners, filteredBanners, isSortEditing, orderedIds]);

  const summaryTotal =
    isSortEditing || !searchQuery ? total : filteredBanners.length;

  return (
    <div className="p-8 pt-24">
      <ProductBannerHeader
        isSavingSort={isUpdatingSort}
        isSortEditing={isSortEditing}
        onAdd={openCreateModal}
        onCancelSortEdit={cancelSortEdit}
        onSaveSortEdit={handleSaveSortEdit}
        onStartSortEdit={startSortEdit}
      />

      <ProductBannerModal
        initialImageUrl={editingBanner?.imageUrl}
        isOpen={isModalOpen}
        isSaving={isCreating || isUpdating}
        onClose={closeModal}
        onSave={handleSaveBanner}
      />

      <div className="mb-6 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600">총 {summaryTotal}개의 배너</p>
        </div>

        <ProductBannerFilters
          isDisabled={isSortEditing}
          onSearch={handleSearch}
          onSearchInputChange={setSearchInput}
          onSearchKeyPress={handleSearchKeyPress}
          searchInput={searchInput}
        />

        <ProductBannerTable
          banners={displayBanners}
          hasSearchQuery={Boolean(searchQuery)}
          isFetching={isFetching}
          isLoading={isLoading}
          isSavingSort={isUpdatingSort}
          isSortEditing={isSortEditing}
          onDelete={handleDeleteBanner}
          onEdit={openEditModal}
          onReorder={handleReorder}
        />
      </div>

      <Pagination
        countOnPage={
          isSortEditing ? displayBanners.length : filteredBanners.length
        }
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

      <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        Tip: 배너 순서를 변경하려면 "순서 편집" 버튼을 클릭하세요.
      </div>
    </div>
  );
}
