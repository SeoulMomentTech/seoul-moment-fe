import type { JSX } from "react";

import { replaceLineBreaks } from "@shared/lib/utils";

export interface HtmlContentProps {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  html?: string | null;
}

export function HtmlContent({
  as: Component = "p",
  className,
  html,
}: HtmlContentProps) {
  if (!html) return null;

  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: replaceLineBreaks(html) }}
    />
  );
}
