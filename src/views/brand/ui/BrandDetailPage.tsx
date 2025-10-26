"use client";

import Image from "next/image";
import { use } from "react";
import { cn } from "@shared/lib/style";
import { replaceLineBreaks } from "@shared/lib/utils";
import type { CommonRes } from "@shared/services";
import type { BrandDetailInfo } from "@shared/services/brand";
import { BrandProducts } from "@widgets/brand-products";

interface BrandDetailPageProps {
  id: number;
  promise: Promise<CommonRes<BrandDetailInfo>>;
}

export default function BrandDetailPage({ promise }: BrandDetailPageProps) {
  const { data } = use(promise);

  return (
    <div>
      {data?.bannerList?.[0] && (
        <section
          className={cn(
            "mx-auto h-[856px] max-w-[1928px] min-w-[1280px] pt-[56px] max-sm:h-[456px]",
            "max-sm:max-w-none max-sm:min-w-auto",
          )}
        >
          <Image
            alt=""
            className="h-full object-cover"
            height={800}
            priority
            src={data.bannerList[0] ?? ""}
            width={4000}
          />
        </section>
      )}
      <article
        className={cn(
          "mx-auto w-[1280px] pt-[100px]",
          "max-sm:w-full max-sm:pt-[90px]",
        )}
      >
        <div
          className={cn(
            "flex gap-[128px] pb-[100px]",
            "max-sm:flex-col max-sm:gap-[40px] max-sm:pb-[90px]",
          )}
        >
          <div
            className={cn(
              "flex min-w-[522px] flex-col gap-[30px] font-semibold",
              "max-sm:min-w-full max-sm:gap-[20px] max-sm:px-[20px]",
            )}
          >
            <h2 className="text-title-2 max-sm:text-title-4">{data?.name}</h2>
            {data?.description && (
              <p
                className="text-title-3 max-sm:text-title-4"
                dangerouslySetInnerHTML={{
                  __html: replaceLineBreaks(data.description),
                }}
              />
            )}
          </div>
          <div
            className={cn(
              "flex flex-col gap-[60px]",
              "max-sm:flex-col-reverse max-sm:gap-[40px] max-sm:px-[20px]",
            )}
          >
            <div
              className={cn("flex flex-col gap-[30px]", "max-sm:gap-[20px]")}
            >
              {data?.section?.[0]?.title && (
                <h4
                  className={cn(
                    "text-body-1 font-semibold",
                    "max-sm:text-body-2",
                  )}
                >
                  {data.section[0].title}
                </h4>
              )}
              {data?.section?.[0]?.content && (
                <p
                  dangerouslySetInnerHTML={{
                    __html: replaceLineBreaks(data.section[0].content),
                  }}
                />
              )}
            </div>
            <div
              className={cn(
                "flex gap-[20px]",
                "max-sm:flex-col max-sm:gap-[40px]",
              )}
            >
              <div className="flex max-sm:justify-start">
                <div
                  className={cn(
                    "h-[500px] w-[305px] bg-slate-300",
                    "max-sm:h-[320px] max-sm:w-[208px]",
                  )}
                />
              </div>
              <div className="flex max-sm:justify-end">
                <div
                  className={cn(
                    "h-[500px] w-[305px] bg-slate-300",
                    "max-sm:h-[320px] max-sm:w-[208px]",
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "flex gap-[65px] pb-[140px]",
            "max-sm:flex-col max-sm:gap-[40px] max-sm:px-[20px] max-sm:pb-[90px]",
          )}
        >
          {data?.section?.[1]?.imageList?.[0] && (
            <div
              className={cn(
                "h-[640px] min-w-[585px] bg-slate-300",
                "max-sm:h-[400px] max-sm:min-w-full",
              )}
            >
              <Image
                alt=""
                className="h-full object-cover"
                height={600}
                src={data.section[1].imageList[0]}
                width={900}
              />
            </div>
          )}
          <div className="flex flex-col justify-end gap-[20px]">
            {data?.section?.[1]?.title && (
              <h4
                className={cn(
                  "text-body-1 font-semibold",
                  "max-sm:text-body-2",
                )}
                dangerouslySetInnerHTML={{
                  __html: replaceLineBreaks(data.section[1].title),
                }}
              />
            )}
            {data?.section?.[1]?.content && (
              <p
                dangerouslySetInnerHTML={{
                  __html: replaceLineBreaks(data.section[1].content),
                }}
              />
            )}
          </div>
        </div>
      </article>
      {data?.bannerList?.[1] && (
        <section
          className={cn(
            "mx-auto h-[800px] min-h-[800px] max-w-[1928px] min-w-[1280px]",
            "max-sm:h-[240px] max-sm:min-h-[240px] max-sm:max-w-none max-sm:min-w-auto",
          )}
        >
          <Image
            alt=""
            className="h-full object-cover"
            height={800}
            src={data.bannerList[1]}
            width={4000}
          />
        </section>
      )}
      <article
        className={cn(
          "mx-auto flex w-[1280px] flex-col gap-[60px] pt-[140px] pb-[100px]",
          "max-sm:w-full max-sm:gap-[40px] max-sm:px-[20px] max-sm:pt-[90px] max-sm:pb-[50px]",
        )}
      >
        {data?.section?.[2]?.title && (
          <h4
            className={cn("text-title-3 font-semibold", "max-sm:text-title-4")}
            dangerouslySetInnerHTML={{
              __html: replaceLineBreaks(data.section[2].title ?? ""),
            }}
          />
        )}
        {data?.section?.[2]?.imageList && (
          <div className="flex items-center justify-center">
            <figure
              className={cn(
                "h-[600px] w-[846px]",
                "max-sm:h-[244px] max-sm:w-full",
              )}
            >
              <Image
                alt=""
                className="h-full object-cover"
                height={600}
                src={data.section[2].imageList[0]}
                width={900}
              />
            </figure>
          </div>
        )}
        {data?.section?.[2]?.content && (
          <p
            dangerouslySetInnerHTML={{
              __html: replaceLineBreaks(data.section[2].content),
            }}
          />
        )}
      </article>
      <BrandProducts id={1} />
    </div>
  );
}
