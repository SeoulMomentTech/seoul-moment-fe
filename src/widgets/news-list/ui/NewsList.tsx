import { ArticleCard } from "@/entities/article";

export default function NewsList() {
  return (
    <div
      className="grid gap-x-[40px] gap-y-[50px] max-sm:gap-x-[16px] max-sm:gap-y-[40px]"
      style={{
        gridTemplateColumns: "repeat(2,1fr)",
      }}
    >
      <ArticleCard className="max-sm:w-full" />
      <ArticleCard className="max-sm:w-full" />
      <ArticleCard className="max-sm:w-full" />
      <ArticleCard className="max-sm:w-full" />
    </div>
  );
}
