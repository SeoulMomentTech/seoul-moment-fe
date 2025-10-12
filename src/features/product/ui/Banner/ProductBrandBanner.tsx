import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useBrandDetail } from "@entities/brand/model/hooks";
import useLanguage from "@shared/lib/hooks/useLanguage";
import { cn } from "@shared/lib/style";
import { Button } from "@shared/ui/button";

interface ProductBrandBannerProps {
  id: number;
}

export default function ProductBrandBanner({ id }: ProductBrandBannerProps) {
  const languageCode = useLanguage();
  const { data } = useBrandDetail({
    params: {
      id,
      languageCode,
    },
    options: {
      queryKey: ["brandDetail", id, languageCode],
    },
  });

  if (!data) return <BannerSkeleton />;

  return (
    <div
      className={cn(
        "mb-[40px] flex gap-[40px]",
        "max-sm:min-h-[400px] max-sm:flex-col max-sm:gap-[20px]",
      )}
    >
      <div
        className={cn(
          "h-[300px] max-w-[522px] bg-slate-300",
          "max-sm:h-[207px] max-sm:w-full max-sm:max-w-full",
        )}
      >
        <Image
          alt=""
          className="h-full w-full object-cover"
          height={400}
          src={data?.bannerList?.[0] ?? ""}
          width={600}
        />
      </div>
      <div className="flex flex-col gap-[20px]">
        <h2 className={cn("text-title-2 font-bold", "max-sm:text-title-3")}>
          {data?.name}
        </h2>
        <div className={cn("flex flex-col gap-[40px]", "max-sm:gap-[20px]")}>
          <p className="text-body-3">{data?.description}</p>
          <Button
            className={cn(
              "w-fit",
              "max-sm:text-body-3 max-sm:h-[38px] max-sm:w-full",
            )}
            variant="outline"
          >
            <Link href={`/brand/${id}`}>브랜드 소개 보기</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

const BannerSkeleton = () => {
  return (
    <div
      className={cn(
        "mb-[40px] flex gap-[40px]",
        "max-sm:min-h-[400px] max-sm:flex-col max-sm:gap-[20px]",
      )}
    >
      <div
        className={cn(
          "h-[300px] w-full max-w-[522px] bg-slate-300",
          "max-sm:h-[207px] max-sm:w-full max-sm:max-w-full",
        )}
      />
      <div className="flex w-full flex-col gap-[20px]">
        <div
          className={cn(
            "h-[40px] w-[500px] bg-slate-300",
            "max-sm:h-[30px] max-sm:w-full",
          )}
        />
        <div className={cn("flex flex-col gap-[40px]", "max-sm:gap-[20px]")}>
          <div className="h-[17.5px] w-[500px] bg-slate-300 max-sm:w-full" />
          <Button
            className={cn(
              "w-fit",
              "max-sm:text-body-3 max-sm:h-[38px] max-sm:w-full",
            )}
            variant="outline"
          >
            브랜드 소개 보기
          </Button>
        </div>
      </div>
    </div>
  );
};
