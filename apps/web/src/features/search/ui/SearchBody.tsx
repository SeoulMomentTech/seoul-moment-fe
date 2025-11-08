"use client";

import { Button } from "@seoul-moment/ui";
import { Input } from "@seoul-moment/ui";
import { ChevronLeft, SearchIcon } from "lucide-react";
import { cn } from "@shared/lib/style";
import XSolidIcon from "@shared/ui/icon/x-solid-icon";
import useSearch from "../model/useSearch";

interface SearchBodyProps {
  value: string;
  handleOnChange(value: string): void;
  handleClose(): void;
}

function Desktop({ value, handleOnChange }: SearchBodyProps) {
  return (
    <div className="max-sm:hidden">
      <div
        className={cn(
          "mx-auto flex h-[103px] flex-col justify-center pb-[20px]",
          "gap-[10px] border-b border-b-black/5",
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-[580px] items-center gap-[4px]",
            "h-[48px] py-[16px]",
            "border-b border-black",
          )}
        >
          <SearchIcon height={16} width={16} />
          <Input
            className={cn(
              "rounded-none border-0 px-0",
              "focus:ring-transparent!",
            )}
            onChange={(e) => handleOnChange(e.target.value)}
            placeholder="검색어를 입력해주세요."
            value={value}
          />
          {value && (
            <Button
              className="h-auto w-auto rounded-full bg-transparent p-0"
              onClick={() => handleOnChange("")}
              type="button"
            >
              <XSolidIcon />
            </Button>
          )}
        </div>
        <div className="mx-auto flex w-[580px] items-center justify-between">
          <div className="flex gap-[8px]" />
          <Button
            className="text-body-5 h-auto p-0 text-black/80 hover:bg-transparent"
            variant="ghost"
          >
            전체 삭제
          </Button>
        </div>
      </div>
    </div>
  );
}

function Mobile({ value, handleOnChange, handleClose }: SearchBodyProps) {
  return (
    <div className="hidden max-sm:block">
      <div
        className={cn(
          "flex items-center",
          "h-[56px] border-b border-b-black/10",
        )}
      >
        <div className="flex w-full items-center gap-[4px] px-[20px]">
          <Button
            className="h-auto w-auto p-0"
            onClick={handleClose}
            variant="ghost"
          >
            <ChevronLeft height={24} width={24} />
          </Button>
          <Input
            className={cn(
              "rounded-none border-0 px-0",
              "focus:ring-transparent!",
            )}
            onChange={(e) => handleOnChange(e.target.value)}
            placeholder="검색어를 입력해주세요."
            value={value}
          />
          {value && (
            <Button
              className="h-auto w-auto rounded-full bg-transparent p-0"
              onClick={() => handleOnChange("")}
              type="button"
            >
              <XSolidIcon height={16} width={16} />
            </Button>
          )}
        </div>
      </div>
      <div />
    </div>
  );
}

function SearchBody({ handleClose }: Pick<SearchBodyProps, "handleClose">) {
  const { value, handleChange } = useSearch();

  return (
    <>
      <Desktop
        handleClose={handleClose}
        handleOnChange={handleChange}
        value={value}
      />
      <Mobile
        handleClose={handleClose}
        handleOnChange={handleChange}
        value={value}
      />
    </>
  );
}

export default SearchBody;
