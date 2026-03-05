import { useId } from "react";

import Image from "next/image";

import { useMediaQuery } from "@/shared/lib/hooks";
import SwitchCase from "@/shared/ui/switch-case";

import { cn, Flex, HStack } from "@seoul-moment/ui";

interface ImageTypeProps {
  imageList: string[];
}

const ImageTypeA = ({ imageList }: ImageTypeProps) => {
  return (
    <div className="relative h-[944px] w-[630px] max-sm:h-[540px] max-sm:w-full">
      <Image
        alt="Lookbook Top"
        className="object-cover"
        fill
        src={imageList[0]}
      />
    </div>
  );
};

const ImageTypeB = ({ imageList }: ImageTypeProps) => {
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
              src={src}
            />
          </div>
        ))}
      </HStack>
    </div>
  );
};

const ImageTypeC = ({ imageList }: ImageTypeProps) => {
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
              src={src}
            />
          </div>
        ))}
      </HStack>
    </div>
  );
};

const ImageTypeD = ({ imageList }: ImageTypeProps) => {
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
            src={imageList[0]}
          />
        </div>
      </Flex>
    </Flex>
  );
};

const ImageTypeE = ({ imageList }: ImageTypeProps) => {
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
          src={imageList[0]}
        />
      </div>
    </Flex>
  );
};

interface ImageContentsProps {
  imageList: string[];
  type: 1 | 2 | 3 | 4 | 5;
}

export function ImageContents({ imageList, type }: ImageContentsProps) {
  return (
    <SwitchCase
      caseBy={{
        1: <ImageTypeA imageList={imageList} />,
        2: <ImageTypeB imageList={imageList} />,
        3: <ImageTypeC imageList={imageList} />,
        4: <ImageTypeD imageList={imageList} />,
        5: <ImageTypeE imageList={imageList} />,
      }}
      defaultComponent={null}
      value={type}
    />
  );
}
