import { cn } from "@shared/lib/style";
import { TermsOfServiceContent } from "@shared/ui/terms-of-service-content";

export function TermsPage() {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[820px] px-[40px] pb-[100px] pt-[60px]",
        "max-sm:px-[20px] max-sm:pb-[50px] max-sm:pt-[40px]",
      )}
    >
      <TermsOfServiceContent />
    </div>
  );
}
