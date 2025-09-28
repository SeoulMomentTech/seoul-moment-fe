import Image from "next/image";
import { replaceLineBreaks } from "@/shared/lib/utils";
import type { ArticleSection } from "@/shared/services/article";
import type { NewsSection } from "@/shared/services/news";

export interface DetailContentProps {
  data: NewsSection[] | ArticleSection[];
}

const styleMap = {
  section:
    "mx-auto w-[1280px] max-sm:w-full pt-[100px] max-sm:pt-[50px] text-center",
};

export function DetailContent({ data }: DetailContentProps) {
  return (
    <section className={styleMap.section}>
      <h3 className="mb-[30px] text-center text-[24px] font-semibold max-sm:px-[20px] max-sm:text-[20px]">
        {data[0].title}
      </h3>
      <h3 className="mb-[40px] text-[24px] font-semibold max-sm:px-[20px] max-sm:text-[20px]">
        {data[0].subTitle}
      </h3>
      <p
        className="mb-[60px] leading-6! text-black/80 max-sm:px-[20px] max-sm:text-start"
        dangerouslySetInnerHTML={{
          __html: replaceLineBreaks(data[0]?.content ?? ""),
        }}
      />
      <div className="mb-[100px] h-[620px] max-sm:h-[200px]">
        <Image
          alt=""
          className="h-full w-full object-cover object-top"
          height={700}
          src={data[0].imageList[0]}
          width={1280}
        />
      </div>
      <div className="flex gap-[128px] max-sm:flex-col-reverse max-sm:gap-[40px]">
        <figure className="h-fit w-[522px] max-sm:mx-[20px] max-sm:h-full max-sm:max-h-[284px] max-sm:w-[264px]">
          <Image
            alt=""
            className="h-full"
            height={600}
            src={data[1].imageList[0]}
            width={600}
          />
        </figure>
        <div className="w-[630px] text-start max-sm:w-full max-sm:px-[20px]">
          <h3 className="mb-[60px] text-[24px] font-semibold max-sm:mb-[30px] max-sm:text-[20px]">
            {data[1].title}
          </h3>

          <div className="flex flex-col gap-[30px] max-sm:gap-[20px]">
            <p className="text-[18px] font-semibold max-sm:text-[16px]">
              {data[1].subTitle}
            </p>
            <p
              dangerouslySetInnerHTML={{
                __html: replaceLineBreaks(data[1]?.content ?? ""),
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
