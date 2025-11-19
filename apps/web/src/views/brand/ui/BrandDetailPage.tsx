"use client";

import { use } from "react";

import Image from "next/image";

import { cn } from "@shared/lib/style";
import type { BrandDetailInfo } from "@shared/services/brand";
import { HtmlContent } from "@shared/ui/html-content";
import { ResponsiveBanner } from "@shared/ui/responsive-banner";

import type { CommonRes } from "@shared/services";
import { BrandProducts } from "@widgets/brand-products";

interface BrandDetailPageProps {
  id: number;
  promise: Promise<CommonRes<BrandDetailInfo>>;
}

export default function BrandDetailPage({ promise }: BrandDetailPageProps) {
  const { data } = use(promise);

  const { bannerList = [], mobileBannerList = [], section = [] } = data;

  const [mainBanner, subBanner] = bannerList;
  const [mobileMainBanner, mobileSubBanner] = mobileBannerList;
  const [first, second, third, fourth, fifth] = section;

  return (
    <div className="**:leading-loose!">
      <ResponsiveBanner
        containerClassName={cn(
          "mx-auto h-[856px] w-[1280px] pt-[56px] max-sm:h-[456px]",
          "max-sm:w-full",
        )}
        desktop={{
          className: "max-sm:hidden",
          height: 600,
          src: mainBanner,
          width: 1300,
        }}
        mobile={{
          className: "hidden max-sm:block",
          height: 600,
          src: mobileMainBanner,
          width: 700,
        }}
      />

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
              "flex min-w-[522px] flex-col gap-[20px] font-semibold",
              "max-sm:min-w-full max-sm:px-[20px]",
            )}
          >
            <h2 className="max-sm:text-title-4 text-[40px]">{data?.name}</h2>
            <HtmlContent className="text-title-4" html={data.description} />
          </div>
          <div
            className={cn(
              "flex flex-col gap-[60px]",
              "max-sm:flex-col-reverse max-sm:gap-[40px] max-sm:px-[20px]",
            )}
          >
            <div className={cn("flex flex-col gap-[20px]")}>
              <HtmlContent
                as="h4"
                className={cn(
                  "text-title-4 bo font-semibold",
                  "max-sm:text-body-2",
                )}
                html={first?.title}
              />
              <HtmlContent html={first?.content} />
            </div>
            <div
              className={cn(
                "flex gap-[20px]",
                "max-sm:flex-col max-sm:gap-[40px]",
              )}
            >
              {first?.imageList?.map((image, idx) => (
                <div
                  className={cn(
                    "flex max-sm:justify-start",
                    idx === 1 && "max-sm:justify-end",
                  )}
                  key={`${image}-${idx + 1}`}
                >
                  <Image
                    alt=""
                    className={cn(
                      "h-[500px] w-[305px] bg-transparent",
                      "max-sm:h-[320px] max-sm:w-[208px]",
                      "object-cover",
                    )}
                    height={500}
                    src={image}
                    width={305}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          className={cn(
            "flex gap-[65px] pb-[140px]",
            "max-sm:flex-col max-sm:gap-[40px] max-sm:px-[20px] max-sm:pb-[90px]",
          )}
        >
          {second?.imageList?.[0] && (
            <div
              className={cn(
                "h-[640px] min-w-[585px] bg-transparent",
                "max-sm:h-[400px] max-sm:min-w-full",
              )}
            >
              <Image
                alt=""
                className="h-full object-cover"
                height={600}
                src={second.imageList[0]}
                width={900}
              />
            </div>
          )}
          <div className="flex flex-col justify-end gap-[20px]">
            <HtmlContent
              as="h4"
              className={cn("text-title-4 font-semibold", "max-sm:text-body-2")}
              html={second?.title}
            />
            <HtmlContent html={second?.content} />
          </div>
        </div>
      </article>

      <ResponsiveBanner
        containerClassName={cn(
          "mx-auto h-[800px] min-h-[800px] w-[1280px]",
          "max-sm:h-[240px] max-sm:min-h-[240px] max-sm:w-full",
        )}
        desktop={{
          className: "max-sm:hidden",
          height: 800,
          src: subBanner,
          width: 1300,
        }}
        mobile={{
          className: "hidden max-sm:block",
          height: 300,
          src: mobileSubBanner,
          width: 700,
        }}
      />

      <article
        className={cn(
          "mx-auto flex w-[1280px] flex-col gap-[60px] pb-[100px] pt-[140px]",
          "max-sm:w-full max-sm:gap-[40px] max-sm:px-[20px] max-sm:pb-[50px] max-sm:pt-[90px]",
        )}
      >
        <HtmlContent
          as="h4"
          className={cn(
            "text-title-3 text-center font-semibold",
            "max-sm:text-title-4",
          )}
          html={third?.title}
        />
        {third?.imageList && (
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
                src={third.imageList[0]}
                width={900}
              />
            </figure>
          </div>
        )}
        <HtmlContent className="text-center" html={third?.content} />
      </article>
      {fourth && (
        <article
          className={cn("mx-auto w-[1280px]", "max-sm:w-full max-sm:pt-[90px]")}
        >
          <div
            className={cn(
              "flex gap-[65px] pb-[140px]",
              "max-sm:flex-col max-sm:gap-[40px] max-sm:px-[20px] max-sm:pb-[90px]",
            )}
          >
            <div className="flex flex-col justify-center gap-[20px]">
              <HtmlContent
                as="h4"
                className={cn(
                  "text-body-1 font-semibold",
                  "max-sm:text-body-2",
                )}
                html={fourth?.title}
              />
              <HtmlContent html={fourth?.content} />
            </div>
            {fourth?.imageList?.[0] && (
              <div
                className={cn(
                  "h-[640px] min-w-[585px] bg-transparent",
                  "max-sm:h-[400px] max-sm:min-w-full",
                )}
              >
                <Image
                  alt=""
                  className="h-full object-cover"
                  height={600}
                  src={fourth.imageList[0]}
                  width={900}
                />
              </div>
            )}
          </div>
        </article>
      )}
      {fifth && (
        <article
          className={cn(
            "mx-auto flex w-[1280px] flex-col gap-[60px] pb-[100px]",
            "max-sm:w-full max-sm:gap-[40px] max-sm:px-[20px] max-sm:pb-[50px] max-sm:pt-[90px]",
          )}
        >
          <HtmlContent
            as="h4"
            className={cn("text-title-3 font-semibold", "max-sm:text-title-4")}
            html={fifth?.title}
          />
          {fifth?.imageList && (
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
                  src={fifth.imageList[0]}
                  width={900}
                />
              </figure>
            </div>
          )}
          <HtmlContent className="text-center" html={fifth?.content} />
        </article>
      )}
      <BrandProducts id={data.id} />
    </div>
  );
}
