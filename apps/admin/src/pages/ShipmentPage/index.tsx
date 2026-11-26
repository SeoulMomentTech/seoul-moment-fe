import { useState, type FormEvent } from "react";

import { Plus, RotateCcw, Search } from "lucide-react";

import { PageHeader } from "@shared/components/page-header";
import { PageSizeSelect } from "@shared/components/page-size-select";
import { Pagination } from "@shared/components/pagination";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@shared/constants/page";
import { CUSTOMS_STATUSES } from "@shared/constants/shipment";
import type {
  AdminShipmentCustomsStatus,
  GetAdminShipmentListParams,
} from "@shared/services/shipment";

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@seoul-moment/ui";

import {
  ShipmentFormDrawer,
  type ShipmentDrawerTarget,
} from "./components/ShipmentFormDrawer";
import { ShipmentTable } from "./components/ShipmentTable";
import { useAdminShipmentListQuery } from "./hooks";

/** 셀렉트에서 "전체"를 고른 상태. API 는 파라미터를 비워 표현한다 */
const ALL_STATUSES = "ALL";
type CustomsStatusFilter = AdminShipmentCustomsStatus | typeof ALL_STATUSES;

/** 모든 필터 컨트롤은 같은 높이를 쓴다. Select 기본 높이(36px)에 맞춘다 */
const CONTROL_HEIGHT = "h-9";

export function ShipmentListPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [customsStatus, setCustomsStatus] =
    useState<CustomsStatusFilter>(ALL_STATUSES);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [drawerTarget, setDrawerTarget] = useState<ShipmentDrawerTarget | null>(
    null,
  );

  const params: GetAdminShipmentListParams = {
    page,
    count: pageSize,
    search: search || undefined,
    customsStatus: customsStatus === ALL_STATUSES ? undefined : customsStatus,
  };

  const { data, isLoading, isFetching } = useAdminShipmentListQuery(params);
  const shipments = data?.data.list ?? [];
  const totalItems = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const hasActiveFilters = search !== "" || customsStatus !== ALL_STATUSES;

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(DEFAULT_PAGE);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setCustomsStatus(ALL_STATUSES);
    setPage(DEFAULT_PAGE);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  };

  const selectedShipmentId =
    drawerTarget?.type === "edit" ? drawerTarget.shipment.shipmentId : null;

  return (
    <div className="p-8 pt-24">
      <PageHeader
        description="국제배송 묶음(박스 1개)마다 운송장·수입신고번호·통관 상태를 기록합니다. 세관 신고를 대신하지 않습니다."
        right={
          <Button onClick={() => setDrawerTarget({ type: "create" })}>
            <Plus className="mr-1 size-4" />
            묶음 등록
          </Button>
        }
        title="통관·물류 관리"
      />

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 p-4">
          <form className="flex gap-2" onSubmit={handleSearch}>
            <Input
              aria-label="검색"
              className={`w-80 rounded-md bg-white py-0 ${CONTROL_HEIGHT}`}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="운송장 · 신고번호 · 주문번호 검색"
              value={searchInput}
            />
            <Button className={CONTROL_HEIGHT} type="submit" variant="outline">
              <Search className="size-4" />
              <span className="sr-only">검색</span>
            </Button>
          </form>

          <Select
            onValueChange={(value) => {
              setCustomsStatus(value as CustomsStatusFilter);
              setPage(DEFAULT_PAGE);
            }}
            value={customsStatus}
          >
            <SelectTrigger
              aria-label="통관 상태"
              className={`w-36 bg-white ${CONTROL_HEIGHT}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="**:cursor-pointer bg-white">
              <SelectItem value={ALL_STATUSES}>통관 전체</SelectItem>
              {CUSTOMS_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              className={CONTROL_HEIGHT}
              onClick={resetFilters}
              variant="ghost"
            >
              <RotateCcw className="mr-1 size-4" />
              초기화
            </Button>
          )}

          <div className="ml-auto">
            <PageSizeSelect
              onChange={(size) => {
                setPageSize(size);
                setPage(DEFAULT_PAGE);
              }}
              value={pageSize}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <ShipmentTable
            hasActiveFilters={hasActiveFilters}
            isFetching={isFetching}
            isLoading={isLoading}
            onSelect={(shipment) => setDrawerTarget({ type: "edit", shipment })}
            selectedShipmentId={selectedShipmentId}
            shipments={shipments}
          />
        </div>

        <div className="border-t border-gray-200 p-4">
          <Pagination
            countOnPage={shipments.length}
            disableNext={isFetching || page >= totalPages || totalItems === 0}
            disablePrev={isFetching || page <= 1}
            onNext={() => handlePageChange(page + 1)}
            onPrev={() => handlePageChange(page - 1)}
            page={page}
            totalPages={totalPages}
          />
        </div>
      </div>

      <ShipmentFormDrawer
        onClose={() => setDrawerTarget(null)}
        target={drawerTarget}
      />
    </div>
  );
}
