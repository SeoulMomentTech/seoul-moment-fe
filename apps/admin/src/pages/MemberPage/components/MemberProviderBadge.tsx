import type { AdminMemberProvider } from "@shared/services/member";

import { cn } from "@seoul-moment/ui";

import {
  MEMBER_PROVIDER_BADGE_CLASS,
  MEMBER_PROVIDER_LABEL,
} from "../constants";

interface MemberProviderBadgeProps {
  provider: AdminMemberProvider;
  className?: string;
}

export function MemberProviderBadge({
  provider,
  className,
}: MemberProviderBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        MEMBER_PROVIDER_BADGE_CLASS[provider],
        className,
      )}
    >
      {MEMBER_PROVIDER_LABEL[provider]}
    </span>
  );
}
