import Image from "next/image";
import { cn } from "@/shared/lib/style";

const styleMap = {
  desktop: {
    section: "mx-auto flex h-[800px] max-w-[1920px] min-w-[1280px] pt-[56px]",
    image: "h-full w-[50%] object-cover",
    titleBox: "w-[50%] bg-[#F0F6FF] pt-[131px] pl-[108px]",
  },
  mobile: {
    section:
      "max-sm:flex max-sm:flex-col max-sm:max-w-auto max-sm:min-w-auto max-sm:w-full",
    image: "max-sm:w-full",
    titleBox: "max-sm:w-full max-sm:py-[40px] max-sm:px-[20px]",
    category: "",
  },
};

const mockMagazineMainData = {
  imageUrl:
    "https://images.unsplash.com/photo-1538329972958-465d6d2144ed?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3",
  category: "Korean Beauty & Fragrance",
  title: "CHWI",
  summary: "요약 내용입니다.",
  date: "2025.05.26",
  author: {
    name: "작가명",
    avatarUrl: "",
  },
};

export function MagazineMain() {
  return (
    <section className={cn(styleMap.desktop.section, styleMap.mobile.section)}>
      <Image
        alt=""
        className={cn(styleMap.desktop.image, styleMap.mobile.image)}
        height={800}
        src={mockMagazineMainData.imageUrl}
        width={4000}
      />
      <div className={cn(styleMap.desktop.titleBox, styleMap.mobile.titleBox)}>
        <div className="mb-[40px] flex flex-col gap-[30px]">
          <div className="flex flex-col gap-[10px]">
            <span className="max-sm:text-[12px]">
              {mockMagazineMainData.category}
            </span>
            <h1 className="text-[64px] font-semibold max-sm:text-[24px]">
              {mockMagazineMainData.title}
            </h1>
          </div>
          <p className="max-sm:text-[14px]">{mockMagazineMainData.summary}</p>
        </div>
        <div
          className={cn(
            "flex flex-col gap-[60px]",
            "max-sm:flex-row-reverse max-sm:items-center max-sm:justify-end max-sm:gap-0",
          )}
        >
          <span>{mockMagazineMainData.date}</span>
          <span className="mx-[10px] hidden h-[8px] w-[1px] max-sm:block max-sm:bg-black/40" />
          <div className="flex items-center gap-[10px] max-sm:gap-[4px]">
            <div className="h-[40px] w-[40px] rounded-full bg-slate-300 max-sm:h-[24px] max-sm:w-[24px]" />
            <span>{mockMagazineMainData.author.name}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
