import Image from "next/image";
import { cn } from "@/shared/lib/style";
import { formatDateTime } from "@/shared/lib/utils";

export interface DetailMainProps {
  imageUrl: string;
  category: string;
  title: string;
  summary: string;
  date: string;
  author: string;
  avatarUrl: string;
}

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

export function DetailMain({
  title,
  summary,
  date,
  author,
  category,
  imageUrl,
  avatarUrl,
}: DetailMainProps) {
  return (
    <section className={cn(styleMap.desktop.section, styleMap.mobile.section)}>
      <Image
        alt=""
        className={cn(styleMap.desktop.image, styleMap.mobile.image)}
        height={1200}
        src={imageUrl}
        width={4000}
      />
      <div className={cn(styleMap.desktop.titleBox, styleMap.mobile.titleBox)}>
        <div className="mb-[40px] flex flex-col gap-[30px]">
          <div className="flex flex-col gap-[10px]">
            <span className="max-sm:text-[12px]">{category}</span>
            <h1 className="text-[64px] font-semibold max-sm:text-[24px]">
              {title}
            </h1>
          </div>
          <p className="max-sm:text-[14px]">{summary}</p>
        </div>
        <div
          className={cn(
            "flex flex-col gap-[60px]",
            "max-sm:flex-row-reverse max-sm:items-center max-sm:justify-end max-sm:gap-0",
          )}
        >
          <span>{formatDateTime(date)}</span>
          <span className="mx-[10px] hidden h-[8px] w-[1px] max-sm:block max-sm:bg-black/40" />
          <div className="flex items-center gap-[10px] max-sm:gap-[4px]">
            <figure className="h-[40px] w-[40px] overflow-hidden rounded-full bg-slate-300 max-sm:h-[24px] max-sm:w-[24px]">
              <Image
                alt=""
                className="h-full w-full"
                height={50}
                src={avatarUrl}
                width={50}
              />
            </figure>
            <span>{author}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
