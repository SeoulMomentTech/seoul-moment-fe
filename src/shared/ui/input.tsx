import { cn } from "@shared/lib/style";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "w-full rounded-[4px] border border-black/20 px-[12px] py-[16px]",
        "disabled:cursor-not-allowed disabled:bg-black/5",
        "placeholder:text-black/40",
        className,
      )}
      data-slot="input"
      type={type}
      {...props}
    />
  );
}

export { Input };
