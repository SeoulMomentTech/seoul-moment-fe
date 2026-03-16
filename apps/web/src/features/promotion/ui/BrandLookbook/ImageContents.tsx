import { useId } from "react";

import Image from "next/image";

import { useMediaQuery } from "@shared/lib/hooks";
import type { BrandSectionType } from "@shared/services/brandPromotion";
import SwitchCase from "@shared/ui/switch-case";

import { cn, Flex, HStack } from "@seoul-moment/ui";

interface ImageTypeProps {
  imageList: string[];
}

const SingleImageContent = ({ imageList }: ImageTypeProps) => {
  return (
    <div className="relative h-[944px] w-[630px] max-sm:h-[540px] max-sm:w-full">
      <Image
        alt="Lookbook Top"
        className="object-cover"
        fill
        sizes="(max-width: 640px) 100vw, 630px"
        src={imageList[0]}
      />
    </div>
  );
};

const PairImageContent = ({ imageList }: ImageTypeProps) => {
  const isMobile = useMediaQuery("(max-width: 40rem)", false);
  const id = useId();

  return (
    <div className="max-w-[1064px] px-4 max-sm:w-full max-sm:px-0">
      <HStack gap={isMobile ? 0 : 30}>
        {imageList.map((src, idx) => (
          <div
            className="relative h-[644px] w-[517px] flex-1 max-sm:h-[218px]"
            key={`${id}-${idx + 1}`}
          >
            <Image
              alt="Lookbook Pair"
              className="object-cover"
              fill
              sizes="(max-width: 640px) 50vw, 517px"
              src={src}
            />
          </div>
        ))}
      </HStack>
    </div>
  );
};

const StripImageContent = ({ imageList }: ImageTypeProps) => {
  const id = useId();

  return (
    <div className="w-full">
      <HStack
        align="center"
        className="mx-auto max-w-[1920px] max-sm:w-full"
        gap={0}
      >
        {imageList.slice(0, 4).map((src, idx) => (
          <div
            className="relative h-[530px] w-full flex-1 max-sm:h-[120px]"
            key={`${id}-${idx + 1}`}
          >
            <Image
              alt="Lookbook Strip"
              className="object-cover"
              fill
              sizes="(max-width: 640px) 25vw, 480px"
              src={src}
            />
          </div>
        ))}
      </HStack>
    </div>
  );
};

const BottomSmallContent = ({ imageList }: ImageTypeProps) => {
  const isMobile = useMediaQuery("(max-width: 40rem)", false);

  return (
    <Flex
      align="center"
      className={cn(
        "w-full max-w-[1280px] max-sm:items-start",
        isMobile ? "mb-[60px]" : "mb-[100px]",
      )}
      direction="column"
    >
      <Flex className="w-full">
        <div className="relative h-[644px] w-[847px] max-sm:h-[220px] max-sm:w-[288px]">
          <Image
            alt="Lookbook Bottom 1"
            className="object-cover"
            fill
            sizes="(max-width: 640px) 288px, 847px"
            src={imageList[0]}
          />
        </div>
      </Flex>
    </Flex>
  );
};

const BottomFullContent = ({ imageList }: ImageTypeProps) => {
  return (
    <Flex
      align="center"
      className="w-full max-w-[1280px] max-sm:items-start"
      direction="column"
    >
      <div className="relative h-[680px] w-full max-sm:h-[261px]">
        <Image
          alt="Lookbook Bottom 2"
          className="object-cover"
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          src={imageList[0]}
        />
      </div>
    </Flex>
  );
};

interface ImageContentsProps {
  imageList: string[];
  type: BrandSectionType;
}

export function ImageContents({ imageList, type }: ImageContentsProps) {
  console.log(type);

  return (
    <SwitchCase
      caseBy={{
        TYPE_1: <SingleImageContent imageList={imageList} />,
        TYPE_2: <PairImageContent imageList={imageList} />,
        TYPE_3: <StripImageContent imageList={imageList} />,
        TYPE_4: <BottomSmallContent imageList={imageList} />,
        TYPE_5: <BottomFullContent imageList={imageList} />,
      }}
      defaultComponent={null}
      value={type}
    />
  );
}
