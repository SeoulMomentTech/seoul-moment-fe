import { cn } from "@shared/lib/style";
import { BaseImage } from "@shared/ui/base-image";
import { Card } from "@shared/ui/card";

import { AuthorWithDate } from "@widgets/author-with-date";

interface FeaturedMainNewsCardProps {
  author: string;
  date: string;
  title: string;
  subTitle: string;
  imageUrl: string;
  className?: string;
}

export function FeaturedMainNewsCard({
  author,
  date,
  title,
  subTitle,
  imageUrl,
  className,
}: FeaturedMainNewsCardProps) {
  return (
    <div
      className={cn(
        "flex h-[596px] w-[460px] flex-col justify-end bg-cover bg-center",
        "max-sm:h-[457px] max-sm:w-full",
        "bg-black/50",
        className,
      )}
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundBlendMode: "darken",
        backgroundSize: "100% 100%",
      }}
    >
      <Card
        className="px-[30px] pb-[50px] text-white"
        extraInfo={
          <AuthorWithDate author={author} date={date} textColor="white" />
        }
        subTitle={<p className="line-clamp-3">{subTitle}</p>}
        title={
          <h4
            className={cn(
              "text-title-3 break-keep font-semibold",
              "max-sm:text-body-2",
            )}
          >
            {title}
          </h4>
        }
      />
    </div>
  );
}

interface FeaturedSubNewsCardProps {
  author: string;
  date: string;
  title: string;
  subTitle: string;
  imageUrl: string;
  className?: string;
}

export function FeaturedSubNewsCard({
  author,
  date,
  title,
  subTitle,
  imageUrl,
  className,
}: FeaturedSubNewsCardProps) {
  return (
    <div
      className={cn(
        "flex h-[596px] w-[370px] flex-col gap-[20px]",
        "max-sm:flex max-sm:h-[435px] max-sm:w-[264px] max-sm:justify-end max-sm:px-[20px]",
        className,
      )}
    >
      <figure
        className={cn(
          "relative flex h-[498px] flex-col bg-black bg-contain bg-center bg-no-repeat",
          "max-sm:h-[342px]",
        )}
      >
        <BaseImage alt="" fill src={imageUrl} />
      </figure>
      <Card
        contentWrapperClassName="gap-[20px]"
        extraInfo={<AuthorWithDate author={author} date={date} />}
        subTitle={<p className="max-sm:text-body-3 line-clamp-3">{subTitle}</p>}
        title={
          <h4
            className={cn(
              "text-body-1 break-keep font-semibold",
              "max-sm:text-body-2",
            )}
          >
            {title}
          </h4>
        }
      />
    </div>
  );
}
