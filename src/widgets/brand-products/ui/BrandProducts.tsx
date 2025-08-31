import { HeartIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import { Card } from "@/shared/ui/card";
import { SectionWithLabel } from "@/widgets/section-with-label";

export default function BrandProducts() {
  return (
    <SectionWithLabel
      className="mx-auto w-[1280px] py-[100px]"
      label={
        <div className="mb-[30px] flex w-full items-end justify-between">
          <h3 className="text-[32px]">
            <b>Brand Products</b>
          </h3>
          <Link className="text-[14px] hover:underline" href="/">
            More
          </Link>
        </div>
      }
    >
      <div className="flex gap-[20px]">
        <Card
          className="gap-[10px]"
          extraInfo={
            <div className="flex gap-[10px] text-[13px] text-black/40">
              <div className="flex items-center gap-[4px]">
                <HeartIcon height={14} width={14} />
                <span>21794</span>
              </div>
              <div className="flex items-center gap-[4px]">
                <StarIcon height={14} width={14} />
                <span>4.5(330)</span>
              </div>
            </div>
          }
          image={<div className="h-[305px] w-[305px] bg-slate-300" />}
          subTitle={
            <span className="text-[14px] font-semibold">189,000원</span>
          }
          title={
            <div className="flex flex-col gap-[8px]">
              <span className="text-[12px] font-semibold">51퍼센트</span>
              <p className="text-[14px]">TUNNEL LINING TROUSE</p>
            </div>
          }
        />
        <Card
          className="gap-[10px]"
          extraInfo={
            <div className="flex gap-[10px] text-[13px] text-black/40">
              <div className="flex items-center gap-[4px]">
                <HeartIcon height={14} width={14} />
                <span>21794</span>
              </div>
              <div className="flex items-center gap-[4px]">
                <StarIcon height={14} width={14} />
                <span>4.5(330)</span>
              </div>
            </div>
          }
          image={<div className="h-[305px] w-[305px] bg-slate-300" />}
          subTitle={
            <span className="text-[14px] font-semibold">189,000원</span>
          }
          title={
            <div className="flex flex-col gap-[8px]">
              <span className="text-[12px] font-semibold">51퍼센트</span>
              <p className="text-[14px]">TUNNEL LINING TROUSE</p>
            </div>
          }
        />
        <Card
          className="gap-[10px]"
          extraInfo={
            <div className="flex gap-[10px] text-[13px] text-black/40">
              <div className="flex items-center gap-[4px]">
                <HeartIcon height={14} width={14} />
                <span>21794</span>
              </div>
              <div className="flex items-center gap-[4px]">
                <StarIcon height={14} width={14} />
                <span>4.5(330)</span>
              </div>
            </div>
          }
          image={<div className="h-[305px] w-[305px] bg-slate-300" />}
          subTitle={
            <span className="text-[14px] font-semibold">189,000원</span>
          }
          title={
            <div className="flex flex-col gap-[8px]">
              <span className="text-[12px] font-semibold">51퍼센트</span>
              <p className="text-[14px]">TUNNEL LINING TROUSE</p>
            </div>
          }
        />
        <Card
          className="gap-[10px]"
          extraInfo={
            <div className="flex gap-[10px] text-[13px] text-black/40">
              <div className="flex items-center gap-[4px]">
                <HeartIcon height={14} width={14} />
                <span>21794</span>
              </div>
              <div className="flex items-center gap-[4px]">
                <StarIcon height={14} width={14} />
                <span>4.5(330)</span>
              </div>
            </div>
          }
          image={<div className="h-[305px] w-[305px] bg-slate-300" />}
          subTitle={
            <span className="text-[14px] font-semibold">189,000원</span>
          }
          title={
            <div className="flex flex-col gap-[8px]">
              <span className="text-[12px] font-semibold">51퍼센트</span>
              <p className="text-[14px]">TUNNEL LINING TROUSE</p>
            </div>
          }
        />
      </div>
    </SectionWithLabel>
  );
}
