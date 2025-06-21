import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/style";

export function Header() {
  return (
    <header
      className={cn(
        "h-[56px] w-full bg-white px-[40px]",
        "fixed top-0 left-0",
        "flex items-center text-[20px]",
      )}
    >
      <div className="flex h-full w-full items-center justify-between">
        <div className="flex items-center gap-[40px]">
          <Link className="h-full" href="/">
            <Image
              alt=""
              className="h-full"
              height={80}
              src="/logo.png"
              width={120}
            />
          </Link>
          <ul className="flex gap-[40px]">
            <li>
              <Link className="py-[20px]" href="/product">
                Product
              </Link>
            </li>
            <li>
              <Link className="py-[20px]" href="/brand">
                Brand
              </Link>
            </li>
            <li>
              <Link className="py-[20px]" href="/news">
                News
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <ul className="flex items-center gap-[40px]">
            <li>
              <Link className="py-[20px]" href="/about">
                About
              </Link>
            </li>
            <li>
              <Link className="py-[20px]" href="/contact">
                Contact
              </Link>
            </li>
            <li>KR</li>
          </ul>
        </div>
      </div>
    </header>
  );
}
