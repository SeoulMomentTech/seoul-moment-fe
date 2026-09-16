import { useState, type KeyboardEvent } from "react";

import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";

import { PageSizeSelect } from "@shared/components/page-size-select";
import type { AdminMemberStatus } from "@shared/services/member";
import type { SortDirection } from "@shared/services/types";
import { toDateInputValue } from "@shared/utils/format";

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from "@seoul-moment/ui";

import {
  MEMBER_PROVIDERS,
  MEMBER_PROVIDER_LABEL,
  MEMBER_STATUS_LABEL,
} from "../../constants";
import {
  ALL_OPTION,
  type MemberAdAgreedFilter,
  type MemberListFilters,
  type MemberProviderFilter,
} from "../hooks";

/** 모든 필터 컨트롤은 같은 높이를 쓴다. Select 기본 높이(36px)에 맞춘다 */
const CONTROL_HEIGHT = "h-9";

const STATUS_OPTIONS: AdminMemberStatus[] = ["ACTIVE", "WITHDRAWN"];

const SORT_LABEL: Record<SortDirection, string> = {
  DESC: "최근 가입순",
  ASC: "오래된 가입순",
};

const AD_AGREED_OPTIONS: { value: MemberAdAgreedFilter; label: string }[] = [
  { value: ALL_OPTION, label: "전체" },
  { value: "AGREED", label: "동의" },
  { value: "NOT_AGREED", label: "미동의" },
];

interface MemberFiltersProps {
  searchInput: string;
  filters: MemberListFilters;
  pageSize: number;
  advancedFilterCount: number;
  onSearchInputChange(value: string): void;
  onSearch(): void;
  onFilterChange<K extends keyof MemberListFilters>(
    key: K,
    value: MemberListFilters[K],
  ): void;
  onPageSizeChange(value: number): void;
}

export function MemberFilters({
  searchInput,
  filters,
  pageSize,
  advancedFilterCount,
  onSearchInputChange,
  onSearch,
  onFilterChange,
  onPageSizeChange,
}: MemberFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(advancedFilterCount > 0);

  const today = toDateInputValue(new Date());

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <div
          className={cn(
            "inline-flex shrink-0 items-center rounded-md border border-gray-200 bg-white p-0.5",
            CONTROL_HEIGHT,
          )}
          role="group"
        >
          {STATUS_OPTIONS.map((status) => (
            <button
              aria-pressed={filters.status === status}
              className={cn(
                "duration-normal h-full rounded px-3 text-sm transition-colors",
                filters.status === status
                  ? "bg-gray-900 font-medium text-white"
                  : "text-gray-600 hover:text-gray-900",
              )}
              key={status}
              onClick={() => onFilterChange("status", status)}
              type="button"
            >
              {MEMBER_STATUS_LABEL[status]}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            aria-label="회원 검색"
            className={cn(
              "rounded-md bg-white py-0 pl-9 placeholder:text-gray-500",
              CONTROL_HEIGHT,
            )}
            onChange={(event) => onSearchInputChange(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="이메일 · 닉네임 · 이름 · 전화번호"
            value={searchInput}
          />
        </div>

        <Button className={cn("shrink-0", CONTROL_HEIGHT)} onClick={onSearch}>
          검색
        </Button>

        <Select
          onValueChange={(value) =>
            onFilterChange("sort", value as SortDirection)
          }
          value={filters.sort}
        >
          <SelectTrigger className={cn("w-36 bg-white", CONTROL_HEIGHT)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="**:cursor-pointer bg-white">
            <SelectItem value="DESC">{SORT_LABEL.DESC}</SelectItem>
            <SelectItem value="ASC">{SORT_LABEL.ASC}</SelectItem>
          </SelectContent>
        </Select>

        <PageSizeSelect onChange={onPageSizeChange} value={pageSize} />

        <button
          aria-expanded={isAdvancedOpen}
          className={cn(
            "duration-normal inline-flex shrink-0 items-center gap-2 rounded-md border px-3 text-sm transition-colors",
            CONTROL_HEIGHT,
            isAdvancedOpen || advancedFilterCount > 0
              ? "border-gray-900 bg-white text-gray-900"
              : "border-gray-200 bg-white text-gray-600 hover:text-gray-900",
          )}
          onClick={() => setIsAdvancedOpen((prev) => !prev)}
          type="button"
        >
          <SlidersHorizontal className="size-4" />
          상세 필터
          {advancedFilterCount > 0 && (
            <span className="rounded-full bg-gray-900 px-1.5 text-xs font-medium tabular-nums text-white">
              {advancedFilterCount}
            </span>
          )}
          <ChevronDown
            className={cn(
              "duration-normal size-4 transition-transform",
              isAdvancedOpen && "rotate-180",
            )}
          />
        </button>
      </div>

      {isAdvancedOpen && (
        <div className="animate-in fade-in-0 slide-in-from-top-2 duration-normal grid gap-4 border-t border-gray-200 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-600" htmlFor="member-provider">
              가입 경로
            </Label>
            <Select
              onValueChange={(value) =>
                onFilterChange("provider", value as MemberProviderFilter)
              }
              value={filters.provider}
            >
              <SelectTrigger
                className={cn("w-full bg-white", CONTROL_HEIGHT)}
                id="member-provider"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="**:cursor-pointer bg-white">
                <SelectItem value={ALL_OPTION}>전체</SelectItem>
                {MEMBER_PROVIDERS.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {MEMBER_PROVIDER_LABEL[provider]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label
              className="text-xs text-gray-600"
              htmlFor="member-joined-from"
            >
              가입일 시작
            </Label>
            <Input
              className={cn("rounded-md bg-white py-0", CONTROL_HEIGHT)}
              id="member-joined-from"
              max={filters.joinedTo || today}
              onChange={(event) =>
                onFilterChange("joinedFrom", event.target.value)
              }
              type="date"
              value={filters.joinedFrom}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-600" htmlFor="member-joined-to">
              가입일 종료
            </Label>
            <Input
              className={cn("rounded-md bg-white py-0", CONTROL_HEIGHT)}
              id="member-joined-to"
              max={today}
              min={filters.joinedFrom || undefined}
              onChange={(event) =>
                onFilterChange("joinedTo", event.target.value)
              }
              type="date"
              value={filters.joinedTo}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-600" htmlFor="member-ad-agreed">
              광고·이벤트 수신
            </Label>
            <Select
              onValueChange={(value) =>
                onFilterChange("adAgreed", value as MemberAdAgreedFilter)
              }
              value={filters.adAgreed}
            >
              <SelectTrigger
                className={cn("w-full bg-white", CONTROL_HEIGHT)}
                id="member-ad-agreed"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="**:cursor-pointer bg-white">
                {AD_AGREED_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
