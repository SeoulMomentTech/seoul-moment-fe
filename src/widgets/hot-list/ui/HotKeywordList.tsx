import StyleCard from "@/entities/article/ui/StyleCard";
import { cn } from "@/shared/lib/style";

const MOCK_HOT_KEYWORD = [
  {
    author: "오끼드",
    date: "2025.05.30",
    category: "ITEM",
    title: "디자인 갤러리",
    subTitle: "마음이 모이는곳",
    imageUrl: "",
  },
  {
    author: "오끼드",
    date: "2025.05.30",
    category: "ITEM",
    title: "디자인 갤러리",
    subTitle: "마음이 모이는곳",
    imageUrl: "",
  },
  {
    author: "오끼드",
    date: "2025.05.30",
    category: "ITEM",
    title: "디자인 갤러리",
    subTitle: "마음이 모이는곳",
    imageUrl: "",
  },
];

interface HotKeywordListProps {
  className?: string;
}

export default function HotKeywordList({ className }: HotKeywordListProps) {
  return (
    <div
      className={cn(
        "flex gap-[30px] max-sm:w-full max-sm:gap-[16px]",
        className,
      )}
    >
      {MOCK_HOT_KEYWORD.map((item, index) => (
        <StyleCard
          className="h-[418px] max-sm:h-[323px] max-sm:min-w-[208px]"
          imageClassName="h-[297px] max-sm:h-[208px]"
          key={`hot-${item.title}-${index + 1}`}
          textColor="white"
          {...item}
        />
      ))}
    </div>
  );
}
