import { PackageOpen } from "lucide-react";

import {
  CUSTOMS_STATUS_BADGE_CLASS,
  CUSTOMS_STATUS_LABEL,
} from "@shared/constants/shipment";
import type {
  AdminShipmentDetail,
  AdminShipmentId,
} from "@shared/services/shipment";
import { EMPTY_VALUE, formatDateTime } from "@shared/utils/format";

import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@seoul-moment/ui";

const SKELETON_ROW_KEYS = ["row-1", "row-2", "row-3", "row-4", "row-5"];
const COLUMN_COUNT = 6;

const CELL_CLASS = "px-4 py-3";
const HEAD_CLASS = "px-4 text-xs font-medium text-gray-500";

interface ShipmentTableProps {
  shipments: AdminShipmentDetail[];
  isLoading: boolean;
  isFetching: boolean;
  hasActiveFilters: boolean;
  selectedShipmentId: AdminShipmentId | null;
  onSelect(shipment: AdminShipmentDetail): void;
}

export function ShipmentTable({
  shipments,
  isLoading,
  isFetching,
  hasActiveFilters,
  selectedShipmentId,
  onSelect,
}: ShipmentTableProps) {
  return (
    <Table
      aria-busy={isFetching}
      className={cn(
        "duration-normal transition-opacity",
        isFetching && !isLoading && "opacity-60",
      )}
    >
      <TableHeader>
        <TableRow>
          <TableHead className={HEAD_CLASS}>묶음</TableHead>
          <TableHead className={HEAD_CLASS}>국제운송장</TableHead>
          <TableHead className={HEAD_CLASS}>수입신고번호</TableHead>
          <TableHead className={HEAD_CLASS}>통관</TableHead>
          <TableHead className={cn(HEAD_CLASS, "text-right")}>주문</TableHead>
          <TableHead className={HEAD_CLASS}>최근 수정</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {isLoading ? (
          SKELETON_ROW_KEYS.map((key) => (
            <TableRow key={key}>
              {Array.from({ length: COLUMN_COUNT }, (_, index) => (
                <TableCell className={CELL_CLASS} key={`${key}-${index}`}>
                  <Skeleton className="h-4 w-16" rounded />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : shipments.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell className="px-4 py-16" colSpan={COLUMN_COUNT}>
              <div className="flex flex-col items-center gap-2 text-center">
                <PackageOpen className="size-8 text-gray-300" />
                <p className="font-medium text-gray-900">
                  {hasActiveFilters
                    ? "조건에 맞는 묶음이 없습니다"
                    : "아직 등록된 국제배송 묶음이 없습니다"}
                </p>
                <p className="max-w-sm text-sm text-gray-500">
                  박스 1개를 묶음 하나로 등록하고 실린 주문을 잇습니다.
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          shipments.map((shipment) => {
            const isSelected = selectedShipmentId === shipment.shipmentId;

            return (
              <TableRow
                aria-selected={isSelected}
                className={cn(
                  "cursor-pointer",
                  isSelected && "bg-gray-100 hover:bg-gray-100",
                )}
                key={shipment.shipmentId}
                onClick={() => onSelect(shipment)}
              >
                <TableCell className={cn(CELL_CLASS, "font-medium")}>
                  <button
                    className="hover:underline"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(shipment);
                    }}
                    type="button"
                  >
                    #{shipment.shipmentId}
                  </button>
                </TableCell>
                <TableCell className={cn(CELL_CLASS, "tabular-nums")}>
                  {shipment.intlTrackingNo ?? EMPTY_VALUE}
                  {shipment.intlCarrier && (
                    <span className="ml-1 text-xs text-gray-500">
                      {shipment.intlCarrier}
                    </span>
                  )}
                </TableCell>
                <TableCell className={cn(CELL_CLASS, "tabular-nums")}>
                  {shipment.importDeclarationNo ?? EMPTY_VALUE}
                </TableCell>
                <TableCell className={CELL_CLASS}>
                  <span
                    className={cn(
                      "inline-flex rounded px-1.5 py-0.5 text-xs font-medium",
                      CUSTOMS_STATUS_BADGE_CLASS[shipment.customsStatus],
                    )}
                  >
                    {CUSTOMS_STATUS_LABEL[shipment.customsStatus]}
                  </span>
                </TableCell>
                <TableCell
                  className={cn(CELL_CLASS, "text-right tabular-nums")}
                >
                  {shipment.orders.length}건
                </TableCell>
                <TableCell className={cn(CELL_CLASS, "text-sm text-gray-500")}>
                  {formatDateTime(shipment.updatedAt)}
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
