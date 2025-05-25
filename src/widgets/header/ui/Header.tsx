import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/style";

export function Header() {
  return (
    <header
      className={cn(
        "min-h-[100px] w-full bg-black px-[40px] py-[16px]",
        "fixed top-0 left-0",
        "jusst flex items-center text-[30px] font-bold",
      )}
    >
      <div className="mx-auto flex w-full max-w-[1500px] items-center">
        <Link className="text-white" href="/">
          Seoul Moment
        </Link>
      </div>
    </header>
  );
}
