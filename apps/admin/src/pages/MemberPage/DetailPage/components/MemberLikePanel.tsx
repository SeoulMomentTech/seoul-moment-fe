import { useState } from "react";

import { ImageWithFallback } from "@shared/components/image-with-fallback";
import { Pagination } from "@shared/components/pagination";
import { DEFAULT_PAGE } from "@shared/constants/page";
import type {
  AdminMemberId,
  AdminMemberLikeType,
} from "@shared/services/member";
import { formatDateTime } from "@shared/utils/format";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@seoul-moment/ui";

import { MemberActivitySection } from "./MemberActivitySection";
import {
  MEMBER_ACTIVITY_PAGE_SIZE,
  MEMBER_LIKE_TYPE_LABEL,
} from "../../constants";
import { useAdminMemberLikeListQuery } from "../../hooks";

const ALL_TYPE = "ALL";

const CELL_CLASS = "px-4 py-3";
const HEAD_CLASS = "px-4 text-xs font-medium text-gray-500";

export function MemberLikePanel({ memberId }: { memberId: AdminMemberId }) {
  const [type, setType] = useState<AdminMemberLikeType | typeof ALL_TYPE>(
    ALL_TYPE,
  );
  const [page, setPage] = useState(DEFAULT_PAGE);

  const { data, isLoading, isFetching } = useAdminMemberLikeListQuery(
    memberId,
    {
      page,
      count: MEMBER_ACTIVITY_PAGE_SIZE,
      type: type === ALL_TYPE ? undefined : type,
    },
  );

  const likes = data?.data.list ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / MEMBER_ACTIVITY_PAGE_SIZE));

  const handleTypeChange = (value: string) => {
    setType(value as AdminMemberLikeType | typeof ALL_TYPE);
    setPage(DEFAULT_PAGE);
  };

  return (
    <MemberActivitySection
      emptyMessage="좋아요한 상품이나 브랜드가 없습니다."
      isEmpty={likes.length === 0}
      isFetching={isFetching}
      isLoading={isLoading}
      pagination={
        <div className="border-t border-gray-200 p-4">
          <Pagination
            countOnPage={likes.length}
            disableNext={isFetching || page >= totalPages}
            disablePrev={isFetching || page <= 1}
            onNext={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            onPrev={() => setPage((prev) => Math.max(prev - 1, 1))}
            page={page}
            totalPages={totalPages}
          />
        </div>
      }
      toolbar={
        <Select onValueChange={handleTypeChange} value={type}>
          <SelectTrigger className="h-9 w-32 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="**:cursor-pointer bg-white">
            <SelectItem value={ALL_TYPE}>전체</SelectItem>
            <SelectItem value="PRODUCT">
              {MEMBER_LIKE_TYPE_LABEL.PRODUCT}
            </SelectItem>
            <SelectItem value="BRAND">
              {MEMBER_LIKE_TYPE_LABEL.BRAND}
            </SelectItem>
          </SelectContent>
        </Select>
      }
      total={total}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={HEAD_CLASS}>종류</TableHead>
            <TableHead className={HEAD_CLASS}>대상</TableHead>
            <TableHead className={HEAD_CLASS}>등록 일시</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {likes.map((like) => (
            <TableRow key={`${like.type}-${like.targetId}`}>
              <TableCell className={CELL_CLASS}>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                  {MEMBER_LIKE_TYPE_LABEL[like.type]}
                </span>
              </TableCell>
              <TableCell className={CELL_CLASS}>
                <div className="flex items-center gap-3">
                  {like.imageUrl && (
                    <ImageWithFallback
                      alt=""
                      className="size-9 shrink-0 rounded object-cover"
                      src={like.imageUrl}
                    />
                  )}
                  <span
                    className={cn(
                      like.name ? "text-gray-900" : "text-gray-500",
                    )}
                  >
                    {like.name ?? `#${like.targetId}`}
                  </span>
                </div>
              </TableCell>
              <TableCell className={cn(CELL_CLASS, "text-gray-600")}>
                {formatDateTime(like.createDate)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </MemberActivitySection>
  );
}
