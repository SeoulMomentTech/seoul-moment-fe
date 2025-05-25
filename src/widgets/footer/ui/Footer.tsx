import { cn } from "@/shared/lib/style";

export function Footer() {
  return (
    <footer
      className={cn(
        "flex flex-col items-center justify-center",
        "min-h-[200px] w-full bg-black px-[40px] py-[40px] font-medium text-white",
      )}
    >
      <div>首爾映像有限公司 （Seoul Moment）｜統一編號: 00148871</div>
      <div>負責人: 朴佑濬 ｜ 地址: 台北市大安區忠孝東路四段231號10樓之2</div>
      <div>
        © {new Date().getFullYear()} Seoul Moment. All Rights Reserved.
      </div>
    </footer>
  );
}
