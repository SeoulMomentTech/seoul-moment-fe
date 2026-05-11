import { ChevronRightIcon } from "lucide-react";

import { cn } from "@shared/lib/style";

import { Link } from "@/i18n/navigation";

interface MyPageInfoListProps {
  className?: string;
}

interface InfoItem {
  label: string;
  href: string;
}

const ITEMS: ReadonlyArray<InfoItem> = [
  { label: "로그인 정보", href: "/mypage" },
  { label: "프로필 관리", href: "/mypage" },
  { label: "주소록", href: "/mypage" },
  { label: "나의 맞춤 정보", href: "/mypage" },
];

export default function MyPageInfoList({ className }: MyPageInfoListProps) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <h2 className="text-body-1 font-bold text-black">내 정보</h2>
      <ul className="flex flex-col">
        {ITEMS.map((item) => (
          <li key={item.label}>
            <Link
              className="text-body-3 flex items-center justify-between border-b border-black/10 py-[16px] text-black/80 transition-colors last:border-b-0 hover:text-black"
              href={item.href}
            >
              <span>{item.label}</span>
              <ChevronRightIcon className="size-5 text-black/30" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
