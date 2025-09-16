import LifeStyleCard from "@/entities/article/ui/StyleCard";
import { cn } from "@/shared/lib/style";

const MOCK_LIFESTYLE = [
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
  {
    author: "오끼드",
    date: "2025.05.30",
    category: "ITEM",
    title: "디자인 갤러리",
    subTitle: "마음이 모이는곳",
    imageUrl: "",
  },
];

interface LifeStyleListProps {
  className?: string;
}

export default function LifeStyleList({ className }: LifeStyleListProps) {
  return (
    <div
      className={cn(
        "grid gap-x-[40px] gap-y-[50px]",
        "max-sm:flex max-sm:flex-col max-sm:gap-[30px]",
        className,
      )}
      style={{
        gridTemplateColumns: `repeat(4,1fr)`,
      }}
    >
      {MOCK_LIFESTYLE.map((item, index) => (
        <LifeStyleCard key={`lifestyle-${item.title}-${index + 1}`} {...item} />
      ))}
    </div>
  );
}
