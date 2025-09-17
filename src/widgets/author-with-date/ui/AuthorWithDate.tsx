import { cn } from "@/shared/lib/style";
import Divider from "@/shared/ui/divider";

interface AuthorWithDateProps {
  author: string;
  date: string;
  textColor?: string;
  className?: string;
}

export default function AuthorWithDate({
  author,
  date,
  textColor = "black",
  className,
}: AuthorWithDateProps) {
  return (
    <div
      className={cn(
        "text-[14px] text-black/40",
        "max-sm:text-[12px]",
        textColor === "white" && "text-white",
        className,
      )}
    >
      <span>{author}</span>
      <Divider
        className={cn(
          "mx-[8px] inline-block bg-black/40 max-sm:inline-block",
          textColor === "white" && "bg-white/80",
        )}
      />
      <span>{date}</span>
    </div>
  );
}
