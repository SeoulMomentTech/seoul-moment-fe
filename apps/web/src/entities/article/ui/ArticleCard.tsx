"use client";

import { useEffect, useState } from "react";

import { DEFAULT_IMAGE_SRC } from "@shared/constants/image";
import { cn } from "@shared/lib/style";
import { BaseImage } from "@shared/ui/base-image";
import { Card } from "@shared/ui/card";

import { AuthorWithDate } from "@widgets/author-with-date";

interface ArticleCardProps {
  className?: string;
  title: string;
  subTitle: string;
  author: string;
  date: string;
  imageUrl: string;
  variant?: "default" | "small";
}

export default function ArticleCard({
  className,
  title,
  subTitle,
  imageUrl,
  author,
  date,
  variant = "default",
}: ArticleCardProps) {
  const [imgSrc, setImgSrc] = useState(imageUrl || DEFAULT_IMAGE_SRC);

  useEffect(() => {
    setImgSrc(imageUrl || DEFAULT_IMAGE_SRC);
  }, [imageUrl]);

  const isSmall = variant === "small";

  return (
    <Card
      className={cn(
        !isSmall && "min-h-[500px] flex-1",
        !isSmall && "max-sm:min-h-[413px] max-sm:w-full",
        isSmall && "gap-[20px]",
        className,
      )}
      contentWrapperClassName={cn(
        !isSmall && "gap-[20px] max-sm:gap-[30px]",
        isSmall && "gap-[20px]",
      )}
      extraInfo={<AuthorWithDate author={author} date={date} />}
      image={
        <figure
          className={cn(
            !isSmall && "h-[400px] w-full max-sm:h-[300px]",
            isSmall && "aspect-152/143 w-full",
          )}
        >
          <BaseImage
            alt=""
            className={cn(
              !isSmall && "h-[400px] object-cover max-sm:h-[300px]",
              isSmall && "aspect-152/143 object-cover",
            )}
            height={isSmall ? 376 : 400}
            onError={() => {
              if (imgSrc !== DEFAULT_IMAGE_SRC) {
                setImgSrc(DEFAULT_IMAGE_SRC);
              }
            }}
            src={imgSrc}
            width={isSmall ? 400 : 800}
          />
        </figure>
      }
      subTitle={
        <p
          className={cn(
            "line-clamp-2",
            !isSmall && "max-sm:min-h-auto max-sm:text-body-3 min-h-[40px]",
            isSmall && "text-body-4 text-black/60",
          )}
        >
          {subTitle}
        </p>
      }
      title={
        <h4
          className={cn(
            "break-keep font-semibold",
            !isSmall && "text-body-1",
            isSmall && "max-sm:text-body-3 max-sm:min-h-[42px]",
          )}
        >
          {title}
        </h4>
      }
    />
  );
}
