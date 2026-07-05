import { useMemo, useState } from "react";

import { PageHeader } from "@shared/components/page-header";
import type {
  AdminNewsHashtag,
  AdminNewsHashtagId,
} from "@shared/services/news";

import {
  useAdminNewsHashtagListQuery,
  useDeleteAdminNewsHashtagMutation,
  useUpdateAdminNewsHashtagMutation,
} from "../hooks";
import { HashtagEditModal, HashtagTable } from "./components";
import {
  EMPTY_NAMES,
  toHashtagNamePayload,
  toHashtagNames,
  type HashtagNames,
} from "./utils";

export default function NewsHashtagPage() {
  const [editingHashtag, setEditingHashtag] =
    useState<AdminNewsHashtag | null>(null);

  const {
    data: hashtagResponse,
    isLoading,
    isFetching,
  } = useAdminNewsHashtagListQuery();

  const { mutateAsync: updateHashtag, isPending: isUpdating } =
    useUpdateAdminNewsHashtagMutation();
  const { mutateAsync: deleteHashtag, isPending: isDeleting } =
    useDeleteAdminNewsHashtagMutation();

  const resetEditState = () => {
    setEditingHashtag(null);
  };

  const openEditModal = (hashtag: AdminNewsHashtag) => {
    setEditingHashtag(hashtag);
  };

  const handleUpdateHashtag = async (values: HashtagNames) => {
    if (!editingHashtag) return;

    try {
      await updateHashtag({
        hashtagId: editingHashtag.id,
        payload: { nameList: toHashtagNamePayload(values) },
      });
      resetEditState();
    } catch (error) {
      console.error("해시태그 수정 오류:", error);
      alert("해시태그를 수정하는 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteHashtag = async (hashtagId: AdminNewsHashtagId) => {
    const confirmed = confirm("정말 이 해시태그를 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await deleteHashtag(hashtagId);
    } catch (error) {
      console.error("해시태그 삭제 오류:", error);
      alert("해시태그를 삭제하는 중 오류가 발생했습니다.");
    }
  };

  const editDefaultValues = useMemo<HashtagNames>(() => {
    if (!editingHashtag) {
      return EMPTY_NAMES;
    }

    return toHashtagNames(editingHashtag.nameList);
  }, [editingHashtag]);

  const hashtags = hashtagResponse?.data.list ?? [];
  const total = hashtagResponse?.data.total ?? 0;
  const isListLoading = isLoading || isFetching;

  return (
    <div className="p-8 pt-24">
      <PageHeader
        description="뉴스 해시태그의 다국어 이름을 조회하고 관리하세요."
        title="해시태그 관리"
      />

      <HashtagEditModal
        defaultValues={editDefaultValues}
        isOpen={editingHashtag !== null}
        isSubmitting={isUpdating}
        onClose={resetEditState}
        onSubmit={handleUpdateHashtag}
      />

      <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600">총 {total}개의 해시태그</p>
        </div>

        <HashtagTable
          hashtags={hashtags}
          isDeleting={isDeleting}
          isLoading={isListLoading}
          onDelete={handleDeleteHashtag}
          onEdit={openEditModal}
        />
      </div>
    </div>
  );
}
