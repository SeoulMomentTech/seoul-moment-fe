"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { DEFAULT_IMAGE_SRC } from "@shared/constants/image";
import { cn } from "@shared/lib/style";
import { Card } from "@shared/ui/card";
import { AuthorWithDate } from "@widgets/author-with-date";

interface ArticleCardProps {
  className?: string;
  title: string;
  subTitle: string;
  author: string;
  date: string;
  imageUrl: string;
}

export default function ArticleCard({
  className,
  title,
  subTitle,
  imageUrl,
  author,
  date,
}: ArticleCardProps) {
  const [imgSrc, setImgSrc] = useState(imageUrl || DEFAULT_IMAGE_SRC);

  useEffect(() => {
    setImgSrc(imageUrl || DEFAULT_IMAGE_SRC);
  }, [imageUrl]);

  return (
    <Card
      className={cn(
        "min-h-[500px] flex-1",
        "max-sm:min-h-[413px] max-sm:w-full",
        className,
      )}
      contentWrapperClassName="gap-[20px] max-sm:gap-[30px]"
      extraInfo={<AuthorWithDate author={author} date={date} />}
      image={
        <figure className={cn("h-[400px] w-full", "max-sm:h-[300px]")}>
          <Image
            alt=""
            className={cn("h-[400px] object-cover", "max-sm:h-[300px]")}
            height={400}
            onError={() => {
              if (imgSrc !== DEFAULT_IMAGE_SRC) {
                setImgSrc(DEFAULT_IMAGE_SRC);
              }
            }}
            src={imgSrc}
            width={800}
          />
        </figure>
      }
      subTitle={
        <p
          className={cn(
            "line-clamp-2 min-h-[40px]",
            "max-sm:text-body-3 max-sm:min-h-auto",
          )}
        >
          {subTitle}
        </p>
      }
      title={
        <h4 className={cn("text-body-1 font-semibold", "max-sm:text-body-2")}>
          {title}
        </h4>
      }
    />
  );
}
