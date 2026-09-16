import { useMemo, useState } from "react";

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@shared/constants/page";
import type {
  AdminMemberProvider,
  AdminMemberStatus,
  GetAdminMemberListParams,
} from "@shared/services/member";
import type { SortDirection } from "@shared/services/types";
import { formatDate } from "@shared/utils/format";

import { MEMBER_PROVIDER_LABEL, MEMBER_STATUS_LABEL } from "../../constants";

/** 셀렉트에서 "전체"를 고른 상태. API 는 파라미터를 비워 표현한다 */
export const ALL_OPTION = "ALL";

export type MemberProviderFilter = AdminMemberProvider | typeof ALL_OPTION;
export type MemberAdAgreedFilter = typeof ALL_OPTION | "AGREED" | "NOT_AGREED";

export interface MemberListFilters {
  provider: MemberProviderFilter;
  status: AdminMemberStatus;
  /** 가입일 시작 (YYYY-MM-DD) */
  joinedFrom: string;
  /** 가입일 종료 (YYYY-MM-DD) */
  joinedTo: string;
  adAgreed: MemberAdAgreedFilter;
  sort: SortDirection;
}

export const DEFAULT_MEMBER_FILTERS: MemberListFilters = {
  provider: ALL_OPTION,
  status: "ACTIVE",
  joinedFrom: "",
  joinedTo: "",
  adAgreed: ALL_OPTION,
  sort: "DESC",
};

/** 상세 필터 영역에 들어가는 항목. 접혀 있을 때 배지 숫자로 센다 */
const ADVANCED_FILTER_KEYS = [
  "provider",
  "joinedFrom",
  "joinedTo",
  "adAgreed",
] as const satisfies readonly (keyof MemberListFilters)[];

export interface MemberFilterChip {
  key: string;
  label: string;
  value: string;
  onRemove(): void;
}

const AD_AGREED_LABEL: Record<Exclude<MemberAdAgreedFilter, "ALL">, string> = {
  AGREED: "동의",
  NOT_AGREED: "미동의",
};

export function useMemberListFilters() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<MemberListFilters>(
    DEFAULT_MEMBER_FILTERS,
  );
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const updateFilter = <K extends keyof MemberListFilters>(
    key: K,
    value: MemberListFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(DEFAULT_PAGE);
  };

  const applySearch = () => {
    setSearch(searchInput.trim());
    setPage(DEFAULT_PAGE);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(DEFAULT_PAGE);
  };

  const resetAll = () => {
    setSearchInput("");
    setSearch("");
    setFilters(DEFAULT_MEMBER_FILTERS);
    setPage(DEFAULT_PAGE);
  };

  const changePageSize = (value: number) => {
    setPageSize(value);
    setPage(DEFAULT_PAGE);
  };

  const params = useMemo<GetAdminMemberListParams>(
    () => ({
      page,
      count: pageSize,
      search: search || undefined,
      sort: filters.sort,
      provider: filters.provider === ALL_OPTION ? undefined : filters.provider,
      status: filters.status,
      joinedFrom: filters.joinedFrom || undefined,
      joinedTo: filters.joinedTo || undefined,
      adAgreed:
        filters.adAgreed === ALL_OPTION
          ? undefined
          : filters.adAgreed === "AGREED",
    }),
    [filters, page, pageSize, search],
  );

  const advancedFilterCount = ADVANCED_FILTER_KEYS.filter(
    (key) => filters[key] !== DEFAULT_MEMBER_FILTERS[key],
  ).length;

  const chips = useMemo<MemberFilterChip[]>(() => {
    const result: MemberFilterChip[] = [];

    if (search) {
      result.push({
        key: "search",
        label: "검색",
        value: search,
        onRemove: clearSearch,
      });
    }

    if (filters.status !== DEFAULT_MEMBER_FILTERS.status) {
      result.push({
        key: "status",
        label: "상태",
        value: MEMBER_STATUS_LABEL[filters.status],
        onRemove: () => updateFilter("status", DEFAULT_MEMBER_FILTERS.status),
      });
    }

    if (filters.provider !== ALL_OPTION) {
      result.push({
        key: "provider",
        label: "가입 경로",
        value: MEMBER_PROVIDER_LABEL[filters.provider],
        onRemove: () =>
          updateFilter("provider", DEFAULT_MEMBER_FILTERS.provider),
      });
    }

    if (filters.joinedFrom || filters.joinedTo) {
      result.push({
        key: "joined",
        label: "가입일",
        value: `${filters.joinedFrom ? formatDate(filters.joinedFrom) : "처음"} ~ ${
          filters.joinedTo ? formatDate(filters.joinedTo) : "오늘"
        }`,
        onRemove: () => {
          setFilters((prev) => ({ ...prev, joinedFrom: "", joinedTo: "" }));
          setPage(DEFAULT_PAGE);
        },
      });
    }

    if (filters.adAgreed !== ALL_OPTION) {
      result.push({
        key: "adAgreed",
        label: "광고 수신",
        value: AD_AGREED_LABEL[filters.adAgreed],
        onRemove: () =>
          updateFilter("adAgreed", DEFAULT_MEMBER_FILTERS.adAgreed),
      });
    }

    return result;
  }, [filters, search]);

  return {
    searchInput,
    search,
    filters,
    page,
    pageSize,
    params,
    chips,
    advancedFilterCount,
    setSearchInput,
    applySearch,
    updateFilter,
    resetAll,
    changePageSize,
    setPage,
  };
}
