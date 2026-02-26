import { Flex, cn } from "@seoul-moment/ui";

const NOTICES = [
  {
    id: "notice-1",
    text: "The 15% coupon is applicable for purchases over USD 200 / THB 6,300 / SGD 250.",
  },
  {
    id: "notice-2",
    text: "Some items may net be eligible for pormo code discounts.",
  },
  {
    id: "notice-3",
    text: "Eligible items for promo codes are subject to change at any time, and restrictions may apply to popular or discounted items.",
  },
  {
    id: "notice-4",
    text: "This event may be changed or terminated without prior notice due to company circumstances.",
  },
];

export function NoticeSection() {
  return (
    <Flex
      align="flex-start"
      className={cn(
        "w-full bg-neutral-50 py-[40px]",
        "max-lg:w-[1280px]",
        "max-sm:w-full max-sm:px-[20px] max-sm:py-[30px]",
      )}
      direction="column"
    >
      <div
        className={cn("mx-auto flex w-full max-w-[1280px] flex-col gap-[20px]")}
      >
        <p className="text-body-3 font-semibold text-black/80">NOTICE</p>
        <ul className="list-inside list-disc flex-col gap-[12px] pl-2">
          {NOTICES.map((notice) => (
            <li className="gap-[10px]" key={notice.id}>
              <span className="text-body-3 leading-relaxed text-black/40">
                {notice.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Flex>
  );
}
