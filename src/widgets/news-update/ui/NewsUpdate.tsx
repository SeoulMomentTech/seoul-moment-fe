import { NewsCard } from "@/entities/news";
import { cn } from "@/shared/lib/style";

const MOCK_NEWS = [
  {
    category: "SNEAKERS",
    title: "사계절 신어도 좋은 여름 신발 추천, 베드락 샌들의 마운틴 글루",
    imageUrl: "",
  },
  {
    category: "SNEAKERS",
    title: "사계절 신어도 좋은 여름 신발 추천, 베드락 샌들의 마운틴 글루",
    imageUrl: "",
  },
  {
    category: "SNEAKERS",
    title: "사계절 신어도 좋은 여름 신발 추천, 베드락 샌들의 마운틴 글루",
    imageUrl: "",
  },
  {
    category: "SNEAKERS",
    title: "사계절 신어도 좋은 여름 신발 추천, 베드락 샌들의 마운틴 글루",
    imageUrl: "",
  },
];

export function NewsUpdate() {
  return (
    <div className={cn("flex flex-1 flex-col gap-[30px]", "max-sm:px-[20px]")}>
      <h2 className="text-title-2 max-sm:text-title-4 font-bold">
        News Update
      </h2>
      <div className="h-ful flex h-[428px] w-full flex-1 flex-col gap-[20px] overflow-auto">
        {MOCK_NEWS.map((news, index) => (
          <NewsCard key={`${news.title}-${index + 1}`} {...news} />
        ))}
      </div>
    </div>
  );
}
