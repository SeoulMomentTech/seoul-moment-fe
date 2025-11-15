import * as React from "react";

import { cn } from "../../lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[4px] border border-black/20 px-[12px] py-[16px]",
        "disabled:cursor-not-allowed disabled:bg-black/5",
        "placeholder:text-black/20",
        className,
      )}
      data-slot="textarea"
      {...props}
    />
  );
}
export { Textarea };
