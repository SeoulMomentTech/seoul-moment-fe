import Image from "next/image";

import { Flex, cn, VStack } from "@seoul-moment/ui";

export interface OnlineEvent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isExpired?: boolean;
}

interface EventCardProps {
  event: OnlineEvent;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <VStack
      className={cn(
        "relative w-[320px] shrink-0 border border-solid px-[16px] py-[30px] transition-all",
        event.isExpired ? "border-black/10 bg-white" : "border-black bg-white",
      )}
      gap={30}
    >
      <Flex
        align="center"
        className="w-full border-b border-solid border-black/10 pb-[20px]"
        justify="center"
      >
        <h4
          className={cn(
            "text-body-1 text-center font-semibold leading-none",
            event.isExpired ? "text-black/20" : "text-black",
          )}
        >
          {event.title}
        </h4>
      </Flex>
      <VStack align="center" className="w-full" gap={30}>
        <p
          className={cn(
            "text-body-3 text-center leading-none",
            event.isExpired ? "text-black/20" : "text-black/80",
          )}
        >
          {event.description}
        </p>
        <div className="relative h-[200px] w-full border border-solid border-black/10">
          <Image
            alt={event.title}
            className={cn("object-cover", event.isExpired && "opacity-50")}
            fill
            src={event.imageUrl}
          />
        </div>
      </VStack>

      {event.isExpired && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <div className="flex h-[126px] items-center justify-center rounded-[999px] bg-[#f33e2a] px-[20px]">
            <span className="text-title-3 text-center font-semibold uppercase text-white">
              Expired
            </span>
          </div>
        </div>
      )}
    </VStack>
  );
}
