import { cn } from "@shared/lib/style";
import { PrivacyPolicyContent } from "@shared/ui/privacy-policy-content";

export function PolicyPage() {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[820px] px-[40px] pb-[100px] pt-[60px]",
        "max-sm:px-[20px] max-sm:pb-[50px] max-sm:pt-[40px]",
      )}
    >
      <PrivacyPolicyContent />
    </div>
  );
}
