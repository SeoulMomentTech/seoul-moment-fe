export interface DetailContentProps {
  title: string;
  subTitle: string;
  content: string;
  brandCeoName: string;
  interview: string[];
}

const styleMap = {
  section:
    "mx-auto w-[1280px] max-sm:w-full pt-[100px] max-sm:pt-[50px] text-center",
};

export function DetailContent({
  title,
  subTitle,
  content,
  brandCeoName,
  interview,
}: DetailContentProps) {
  return (
    <section className={styleMap.section}>
      <h3 className="mb-[30px] text-center text-[24px] font-semibold max-sm:px-[20px] max-sm:text-[20px]">
        {subTitle}
      </h3>
      <h3 className="mb-[40px] text-[24px] font-semibold max-sm:px-[20px] max-sm:text-[20px]">
        {title}
      </h3>
      <p className="mb-[60px] leading-6! text-black/80 max-sm:px-[20px] max-sm:text-start">
        {content}
      </p>
      <div className="mb-[100px] h-[620px] bg-slate-300 max-sm:h-[200px]" />
      <div className="flex gap-[128px] max-sm:flex-col-reverse max-sm:gap-[40px]">
        <div className="max-sm:h- h-[600px] w-[522px] bg-slate-300 max-sm:mx-[20px] max-sm:h-[284px] max-sm:w-[264px]" />
        <div className="w-[630px] text-start max-sm:w-full max-sm:px-[20px]">
          <h3 className="mb-[60px] text-[24px] font-semibold max-sm:mb-[30px] max-sm:text-[20px]">
            {brandCeoName}
          </h3>
          <div className="flex flex-col gap-[30px] max-sm:gap-[20px]">
            {interview.map((item, index) => (
              <p
                className={
                  index === 0
                    ? "text-[18px] font-semibold max-sm:text-[16px]"
                    : ""
                }
                key={item}
              >
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
