import { useState } from "react";

import { ImageWithFallback } from "@shared/components/image-with-fallback";
import { Pagination } from "@shared/components/pagination";
import { DEFAULT_PAGE } from "@shared/constants/page";
import type { AdminMemberId } from "@shared/services/member";
import { formatDateTime } from "@shared/utils/format";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@seoul-moment/ui";

import { MemberActivitySection } from "./MemberActivitySection";
import { MEMBER_ACTIVITY_PAGE_SIZE } from "../../constants";
import { useAdminMemberRecentListQuery } from "../../hooks";

const CELL_CLASS = "px-4 py-3";
const HEAD_CLASS = "px-4 text-xs font-medium text-gray-500";

export function MemberRecentPanel({ memberId }: { memberId: AdminMemberId }) {
  const [page, setPage] = useState(DEFAULT_PAGE);

  const { data, isLoading, isFetching } = useAdminMemberRecentListQuery(
    memberId,
    { page, count: MEMBER_ACTIVITY_PAGE_SIZE },
  );

  const items = data?.data.list ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / MEMBER_ACTIVITY_PAGE_SIZE));

  return (
    <MemberActivitySection
      emptyMessage="최근 본 상품이 없습니다."
      isEmpty={items.length === 0}
      isFetching={isFetching}
      isLoading={isLoading}
      pagination={
        <div className="border-t border-gray-200 p-4">
          <Pagination
            countOnPage={items.length}
            disableNext={isFetching || page >= totalPages}
            disablePrev={isFetching || page <= 1}
            onNext={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            onPrev={() => setPage((prev) => Math.max(prev - 1, 1))}
            page={page}
            totalPages={totalPages}
          />
        </div>
      }
      total={total}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={HEAD_CLASS}>상품</TableHead>
            <TableHead className={HEAD_CLASS}>마지막으로 본 일시</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.productItemId}>
              <TableCell className={CELL_CLASS}>
                <div className="flex items-center gap-3">
                  {item.imageUrl && (
                    <ImageWithFallback
                      alt=""
                      className="size-9 shrink-0 rounded object-cover"
                      src={item.imageUrl}
                    />
                  )}
                  <span
                    className={cn(
                      item.name ? "text-gray-900" : "text-gray-500",
                    )}
                  >
                    {item.name ?? `#${item.productItemId}`}
                  </span>
                </div>
              </TableCell>
              <TableCell className={cn(CELL_CLASS, "text-gray-600")}>
                {formatDateTime(item.updateDate)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </MemberActivitySection>
  );
}
