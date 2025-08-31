import Link from "next/link";
import { MoreMagazineList } from "@/widgets/more-magazine-list";
import { SectionWithLabel } from "@/widgets/section-with-label";

export function MagazineList() {
  return (
    <div className="mx-auto mt-[-128px] bg-black/5">
      <SectionWithLabel
        className="mx-auto w-[1280px] pt-[228px] pb-[100px]"
        label={
          <div className="mb-[30px] flex w-full items-end justify-between">
            <h3 className="text-[32px]">
              <b>지난 매거진 보러 가기</b>
            </h3>
            <Link className="text-[14px] hover:underline" href="/">
              More
            </Link>
          </div>
        }
      >
        <MoreMagazineList />
      </SectionWithLabel>
    </div>
  );
}
