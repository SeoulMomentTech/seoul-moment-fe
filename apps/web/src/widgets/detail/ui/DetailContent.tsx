import { cn } from "@seoul-moment/ui";
import { DEFAULT_IMAGE_SRC } from "@shared/constants/image";
import { createMarkup } from "@shared/lib/utils";
import type { ArticleSection } from "@shared/services/article";
import type { NewsSection } from "@shared/services/news";
import { BaseImage } from "@shared/ui/base-image";

export interface DetailContentProps {
  data: NewsSection[] | ArticleSection[];
}

const styleMap = {
  section:
    "mx-auto w-[1280px] max-sm:w-full pt-[100px] max-sm:pt-[50px] text-center",
};

export function DetailContent({ data }: DetailContentProps) {
  const sections = data ?? [];
  const [first, second, third, fourth] = sections;

  if (!first) {
    return null;
  }

  return (
    <section className={styleMap.section}>
      <div>
        <h3
          className={cn(
            "mb-[30px] text-center text-[40px] font-semibold",
            "max-sm:text-title-4 max-sm:px-[20px]",
          )}
        >
          {first?.title}
        </h3>
        <h4
          className={cn(
            "mb-[40px] text-[22px] font-semibold",
            "max-sm:text-body-2 max-sm:px-[20px]",
          )}
        >
          {first?.subTitle}
        </h4>
        <p
          className={cn(
            "leading-6! mb-[60px] text-black/80",
            "max-sm:px-[20px] max-sm:text-start",
          )}
          dangerouslySetInnerHTML={createMarkup(first?.content)}
        />
        <div className="mb-[100px] h-[642px] max-sm:mb-[90px] max-sm:h-[200px]">
          <BaseImage
            alt=""
            className="h-full w-full object-cover object-top"
            height={700}
            src={first?.imageList?.[0] ?? DEFAULT_IMAGE_SRC}
            width={1280}
          />
        </div>
      </div>
      <div
        className={cn(
          "mb-[140px] flex gap-[128px]",
          "max-sm:mb-[50px] max-sm:flex-col-reverse max-sm:gap-[40px]",
        )}
      >
        <figure
          className={cn(
            "relative h-[681px] w-[523px]",
            "max-sm:mx-[20px] max-sm:h-[284px] max-sm:w-[264px]",
          )}
        >
          <BaseImage
            alt=""
            className="h-full w-full"
            fill
            sizes="(max-width:640px) 264px, 523px"
            src={second?.imageList?.[0] ?? DEFAULT_IMAGE_SRC}
          />
        </figure>
        <div className="w-[630px] text-start max-sm:w-full max-sm:px-[20px]">
          <h3 className="text-title-3 max-sm:text-title-4 mb-[60px] font-semibold max-sm:mb-[30px]">
            {second?.title}
          </h3>
          <div className="flex flex-col gap-[30px] max-sm:gap-[20px]">
            <p className="text-body-1 max-sm:text-body-2 font-semibold">
              {second?.subTitle}
            </p>
            <p dangerouslySetInnerHTML={createMarkup(second?.content)} />
          </div>
        </div>
      </div>
      <div
        className={cn(
          "mb-[100px] flex gap-[128px]",
          "max-sm:mb-[90px] max-sm:flex-col-reverse max-sm:items-end max-sm:gap-[40px]",
        )}
      >
        <div
          className={cn(
            "w-[630px] text-start max-sm:w-full max-sm:px-[20px]",
            third.imageList.length === 0 && "w-full text-center",
          )}
        >
          <h3 className="text-title-3 max-sm:text-title-4 mb-[30px] font-semibold max-sm:mb-[30px]">
            {third?.title}
          </h3>
          <div className="flex flex-col gap-[30px] max-sm:gap-[20px]">
            <p className="text-body-1 max-sm:text-body-2 font-semibold">
              {third?.subTitle}
            </p>
            <p dangerouslySetInnerHTML={createMarkup(third?.content)} />
          </div>
        </div>
        {third?.imageList.length > 0 && (
          <figure
            className={cn(
              "relative h-[680px] w-[541px]",
              "max-sm:mx-[20px] max-sm:h-[284px] max-sm:w-[264px]",
            )}
          >
            <BaseImage
              alt=""
              className="h-full object-cover"
              fill
              sizes="(max-width: 640px) 264px, 541px"
              src={third.imageList[0] ?? DEFAULT_IMAGE_SRC}
            />
          </figure>
        )}
      </div>
      <div
        className={cn(
          "mb-[140px] flex flex-col gap-[40px]",
          "max-sm:mb-[90px] max-sm:gap-[50px]",
          fourth?.imageList.length === 0 && "text-center",
        )}
      >
        {fourth?.imageList.length > 0 && (
          <figure className="h-[482px] max-sm:h-[200px]">
            <BaseImage
              alt=""
              className="h-full w-full object-cover"
              height={500}
              src={fourth.imageList[0] ?? DEFAULT_IMAGE_SRC}
              width={1280}
            />
          </figure>
        )}
        <div className="space-y-[30px] max-sm:px-[20px]">
          <h3
            className={cn("text-title-3 font-semibold", "max-sm:text-title-4")}
          >
            {fourth?.title}
          </h3>
          <div className="flex flex-col gap-[30px] max-sm:gap-[20px]">
            <p
              className={cn("text-body-1 font-semibold", "max-sm:text-body-2")}
            >
              {fourth?.subTitle}
            </p>
            <p dangerouslySetInnerHTML={createMarkup(fourth?.content)} />
          </div>
        </div>
      </div>
    </section>
  );
}
