import { SectionWithLabel } from "@/widgets/section-with-label";

export function Journal() {
  return (
    <div className="flex flex-col gap-[40px] pb-[60px]">
      <h2 className="text-center text-[28px] font-semibold">JOURNAL</h2>
      <div className="flex flex-col gap-[40px]">
        <SectionWithLabel
          className="gap-[20px] px-[40px]"
          label={
            <h2>
              <b>SEASONAL NEWS</b>
            </h2>
          }
        >
          <div className="flex flex-wrap gap-[12px]">
            <div className="h-[500px] flex-1 bg-gray-300" />
            <div className="h-[500px] flex-1 bg-gray-300" />
          </div>
        </SectionWithLabel>
        <SectionWithLabel
          className="gap-[20px] px-[40px]"
          label={
            <h2>
              <b>HORIZON SERIES</b>
            </h2>
          }
        >
          <div className="flex flex-wrap gap-[12px]">
            <div className="h-[500px] flex-1 bg-gray-300" />
            <div className="h-[500px] flex-1 bg-gray-300" />
          </div>
        </SectionWithLabel>
      </div>
    </div>
  );
}
