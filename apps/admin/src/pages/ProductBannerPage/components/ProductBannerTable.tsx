import { useState, type DragEvent } from "react";

import { Edit, GripVertical, Trash2 } from "lucide-react";

import { ImageWithFallback } from "@shared/components/image-with-fallback";
import type {
  AdminProductBannerListItem,
  ProductBannerId,
} from "@shared/services/productBanner";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@seoul-moment/ui";

interface ProductBannerTableProps {
  banners: AdminProductBannerListItem[];
  isLoading: boolean;
  isFetching: boolean;
  isSortEditing: boolean;
  isSavingSort: boolean;
  hasSearchQuery: boolean;
  onReorder(dragId: ProductBannerId, targetId: ProductBannerId): void;
  onEdit(banner: AdminProductBannerListItem): void;
  onDelete(bannerId: ProductBannerId): void;
}

const getFileName = (url: string) => {
  if (!url) return "";
  const [path] = url.split("?");
  const segments = path.split("/");
  return segments[segments.length - 1] ?? "";
};

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString() : "-";

export function ProductBannerTable({
  banners,
  isLoading,
  isFetching,
  isSortEditing,
  isSavingSort,
  hasSearchQuery,
  onReorder,
  onEdit,
  onDelete,
}: ProductBannerTableProps) {
  const [draggingId, setDraggingId] = useState<ProductBannerId | null>(null);
  const [overId, setOverId] = useState<ProductBannerId | null>(null);
  const isListLoading = isLoading || isFetching;

  const handleDragStart = (bannerId: ProductBannerId) => () => {
    setDraggingId(bannerId);
  };

  const handleDragOver = (bannerId: ProductBannerId) => (event: DragEvent) => {
    event.preventDefault();
    setOverId(bannerId);
  };

  const handleDrop = (bannerId: ProductBannerId) => (event: DragEvent) => {
    event.preventDefault();
    if (!draggingId || draggingId === bannerId) {
      setOverId(null);
      return;
    }
    onReorder(draggingId, bannerId);
    setOverId(null);
    setDraggingId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setOverId(null);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">ID</TableHead>
          <TableHead className="w-20">순서</TableHead>
          <TableHead className="w-[140px]">이미지</TableHead>
          <TableHead>링크 URL</TableHead>
          <TableHead className="w-[160px]">생성 시간</TableHead>
          <TableHead className="w-[120px] text-center">액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isListLoading ? (
          <TableRow>
            <TableCell className="py-12 text-center text-gray-500" colSpan={5}>
              배너를 불러오는 중입니다.
            </TableCell>
          </TableRow>
        ) : banners.length === 0 ? (
          <TableRow>
            <TableCell className="py-12 text-center text-gray-500" colSpan={5}>
              {hasSearchQuery
                ? "검색 결과가 없습니다."
                : "등록된 배너가 없습니다."}
            </TableCell>
          </TableRow>
        ) : (
          banners.map((banner, idx) => {
            const linkUrl =
              (banner as AdminProductBannerListItem & { linkUrl?: string })
                .linkUrl ?? "-";

            return (
              <TableRow
                className={
                  isSortEditing && overId === banner.id
                    ? "bg-gray-50"
                    : undefined
                }
                draggable={isSortEditing}
                key={banner.id}
                onDragEnd={handleDragEnd}
                onDragOver={
                  isSortEditing ? handleDragOver(banner.id) : undefined
                }
                onDragStart={
                  isSortEditing ? handleDragStart(banner.id) : undefined
                }
                onDrop={isSortEditing ? handleDrop(banner.id) : undefined}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {isSortEditing && (
                      <GripVertical className="h-4 w-4 text-gray-400" />
                    )}
                    {banner.id}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">{idx + 1}</div>
                </TableCell>
                <TableCell>
                  <ImageWithFallback
                    alt={`banner-${banner.id}`}
                    className="h-16 w-24 rounded-lg border border-gray-200 object-cover"
                    height={64}
                    src={banner.imageUrl}
                    width={96}
                  />
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {linkUrl}
                  <p className="text-xs text-gray-500">
                    {getFileName(banner.imageUrl)}
                  </p>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatDate(banner.createDate)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button
                      disabled={isSortEditing || isSavingSort}
                      onClick={() => onEdit(banner)}
                      size="sm"
                      variant="ghost"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      disabled={isSortEditing || isSavingSort}
                      onClick={() => onDelete(banner.id)}
                      size="sm"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
