import { Link } from "@/i18n/navigation";
import { SectionWithLabel } from "@widgets/section-with-label";

export function IconNic() {
  return (
    <SectionWithLabel
      className="mt-[60px] w-full gap-[14px] px-[40px] pb-[50px]"
      label={
        <div className="flex w-full items-center justify-between">
          <h2 className="text-body-1">
            <b>THE ICONIC SILHOUETTES</b>
          </h2>
          <Link className="hover:underline" href="/">
            More
          </Link>
        </div>
      }
    >
      <div>
        <div className="flex min-h-[600px] w-full">
          <div className="flex-1 bg-gray-300" />
          <div className="flex-1 bg-gray-300" />
          <div className="flex-1 bg-gray-300" />
        </div>
      </div>
    </SectionWithLabel>
  );
}
