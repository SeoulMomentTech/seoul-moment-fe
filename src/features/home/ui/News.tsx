import Link from "next/link";
import { SectionWithLabel } from "@/widgets/section-with-label";

export function News() {
  return (
    <SectionWithLabel
      className="px-[30px] py-[100px]"
      label={
        <div className="mb-[30px] flex w-full items-end justify-between">
          <h3 className="text-[36px]">
            <b>NEWS</b>
          </h3>
          <Link className="text-[14px] hover:underline" href="/">
            More
          </Link>
        </div>
      }
    >
      <div className="flex justify-between gap-[60px]">
        <div className="flex h-[940px] w-[740px] flex-col bg-gray-400" />
        <div className="flex justify-between gap-[60px] pt-[64px]">
          <div className="flex h-[876px] w-[580px] flex-col bg-gray-400" />
          <div className="flex h-[750px] w-[420px] flex-col bg-gray-400" />
        </div>
      </div>
    </SectionWithLabel>
  );
}
