import { Link } from "@/i18n/navigation";
import { SectionWithLabel } from "@/widgets/section-with-label";

export function Article() {
  return (
    <SectionWithLabel
      className="w-full gap-[30px] px-[30px] py-[100px]"
      label={
        <div className="mb-[30px] flex w-full items-end justify-between">
          <h3 className="text-[36px]">
            <b>Article</b>
          </h3>
          <Link className="text-[14px] hover:underline" href="/">
            More
          </Link>
        </div>
      }
    >
      <div className="flex flex-wrap gap-[60px]">
        <div className="h-[500px] flex-1 bg-gray-300" />
        <div className="h-[500px] flex-1 bg-gray-300" />
      </div>
    </SectionWithLabel>
  );
}
