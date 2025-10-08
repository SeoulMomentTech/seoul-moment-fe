import Image from "next/image";
import { InquiryForm } from "@/features/inquiry";
import { cn } from "@/shared/lib/style";
import Divider from "@/shared/ui/divider";

export function InquiryPage() {
  return (
    <div className="flex gap-[205px] pb-[100px] max-sm:pb-[50px]">
      <div
        className={cn(
          "flex w-[630px] flex-col gap-[40px]",
          "max-sm:w-full max-sm:gap-[36px] max-sm:pt-[20px]",
        )}
      >
        <div>
          <h2 className="text-title-2 mb-[16px] font-bold max-sm:text-[28px]">
            We’re Waiting for
            <br />
            Our Moment
          </h2>
          <p className="text-body-3 mb-[30px] text-black/40 max-sm:mb-[20px]">
            서울모먼트는 감각적인 연결을 만들어갑니다.
            <br className="hidden max-sm:block" />
            당신의 이야기를 기다리고 있습니다.
          </p>
          <div
            className={cn(
              "text-body-3 flex items-center",
              "max-sm:text-body-4 max-sm:flex-col max-sm:gap-[16px] max-sm:text-black/60",
              "max-sm:items-start",
            )}
          >
            <span>✉ 고객 응대 및 피드백</span>
            <Divider className="block bg-black/40 max-sm:hidden" />
            <span>🤝 브랜드 제휴·유통 협력 (한/대만)</span>
            <Divider className="block bg-black/40 max-sm:hidden" />
            <span>🎥 인플루언서 및 콘텐츠 파트너 제안</span>
          </div>
        </div>
        <InquiryForm />
      </div>
      <div className="flex w-[120px] flex-col gap-[16px] max-sm:hidden">
        <figure>
          <Image alt="" height={120} src="/qr/line.png" width={120} />
        </figure>
        <figure>
          <Image alt="" height={300} src="/qr/kakao.png" width={300} />
        </figure>
      </div>
    </div>
  );
}
