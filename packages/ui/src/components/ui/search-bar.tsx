import * as React from "react";

import { Search } from "lucide-react";

import { cn } from "../../lib/utils";

export interface SearchBarProps extends React.ComponentProps<"input"> {
  onSearch?(value: string): void;
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, onSearch, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSearch) {
        onSearch(e.currentTarget.value);
      }
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    };

    return (
      <div className={cn("relative flex items-center w-full", className)}>
        <input
          className={cn(
            "w-full rounded-[4px] border border-black/20 bg-white px-[12px] h-full pr-[44px]",
            "text-[14px] leading-none text-black placeholder:text-black/20",
            "focus:outline-none focus:ring-0",
            "disabled:cursor-not-allowed disabled:bg-black/5"
          )}
          onKeyDown={handleKeyDown}
          ref={ref}
          {...props}
        />
        <Search
          className="absolute right-[12px] text-black/20 pointer-events-none"
          size={24}
        />
      </div>
    );
  }
);
SearchBar.displayName = "SearchBar";

export { SearchBar };
