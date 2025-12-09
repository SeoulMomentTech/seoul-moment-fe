import { Share2Icon } from "lucide-react";

import Image from "next/image";

import { useBrandBanner } from "@entities/brand/model/hooks/useBrandBanner";
import useLanguage from "@shared/lib/hooks/useLanguage";
import useModal from "@shared/lib/hooks/useModal";
import { cn } from "@shared/lib/style";

import { Link } from "@/i18n/navigation";

import { Button } from "@seoul-moment/ui";

interface ProductBrandBannerProps {
  id: number;
}

export default function ProductBrandBanner({ id }: ProductBrandBannerProps) {
  const { openModal } = useModal();
  const languageCode = useLanguage();
  const { data } = useBrandBanner({
    params: {
      brandId: id,
      languageCode,
    },
    options: {
      queryKey: ["productBrandBanner", id, languageCode],
      throwOnError: true,
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
          "h-[300px] min-w-[522px] bg-slate-300",
          "max-sm:h-[207px] max-sm:min-w-full",
        )}
      >
        <Image
          alt=""
          className="h-full w-full object-cover"
          height={400}
          src={data.banner}
          width={600}
        />
      </div>
      <div className="flex flex-1 flex-col gap-[20px]">
        <div
          className={cn(
            "flex items-center justify-between",
            "max-sm:items-start",
          )}
        >
          <div>
            <h2
              className={cn(
                "text-title-2 mb-[12px] font-bold",
                "max-sm:text-title-3",
              )}
            >
              {data?.name}
            </h2>
            <p className="text-black/50">{data?.englishName}</p>
          </div>
          <Button
            className="h-auto w-auto rounded-full p-3"
            onClick={() => openModal("share")}
            type="button"
            variant="ghost"
          >
            <Share2Icon height={20} width={20} />
          </Button>
        </div>
        <div className={cn("flex flex-col gap-[40px]", "max-sm:gap-[20px]")}>
          <p className="text-body-3">{data?.description ?? ""}</p>
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
          "h-[300px] min-w-[522px] bg-slate-300",
          "max-sm:h-[207px] max-sm:min-w-full max-sm:max-w-full",
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
