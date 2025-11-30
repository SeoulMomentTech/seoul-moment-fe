import type { PropsWithChildren } from "react";

import OptionFilter from "./OptionFilter";
import RefreshFilter from "./RefreshFilter";
import { SortFilter, SortFilterSkeleton } from "./SortFilter";

export default function FilterBar({ children }: PropsWithChildren) {
  return <div className="flex items-center">{children}</div>;
}

FilterBar.Sort = SortFilter;
FilterBar.SortSkeleton = SortFilterSkeleton;
FilterBar.Option = OptionFilter;
FilterBar.Refresh = RefreshFilter;
