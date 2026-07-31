import { toNTCurrency } from "@shared/lib/utils";
import type { ProductItem } from "@shared/services/product";
import { BaseImage } from "@shared/ui/base-image";

import { Link } from "@/i18n/navigation";

import { ChatCardRail } from "./ChatCardRail";
import { useChatbotCopy } from "../model/useChatbotCopy";

interface ChatProductCardsProps {
  products: ProductItem[];
}

/**
 * entities/product 의 ProductCard 를 재사용하지 않는다 — 305px 정사각 그리드
 * 카드이고 gap-[30px] 를 전제해 380px 패널에 들어가지 않는다. 재사용하는 것은
 * ProductItem **타입**이며, 그게 실 API 전환의 이음새다.
 *
 * 카드 폭을 고정하는 대신 제목에 2줄 높이를 예약한다. 그래야 ko/en/zh-TW 에서
 * 카드 높이가 들쭉날쭉해지지 않는다.
 */
export function ChatProductCards({ products }: ChatProductCardsProps) {
  const copy = useChatbotCopy();

  if (products.length === 0) return null;

  return (
    <ChatCardRail
      summary={`${products.length}${copy("chatbot_products_count")}`}
    >
      {products.map((product) => (
        <li className="w-[136px] shrink-0" key={product.id}>
          <Link
            className="focus-ring group/card duration-normal block rounded-lg border border-black/10 p-2 transition-colors hover:border-black/30"
            href={`/product/${product.id}`}
          >
            <div className="relative mb-2 aspect-square overflow-hidden rounded bg-black/5">
              <BaseImage
                alt={product.productName}
                className="duration-slow object-cover transition-transform group-hover/card:scale-105"
                fill
                sizes="136px"
                src={product.image}
                unoptimized
              />
            </div>
            <p className="text-body-5 truncate text-black/60">
              {product.brandName}
            </p>
            {/* 2줄 고정 — line-clamp 만으로는 1줄 제목 카드가 짧아진다. */}
            <p className="text-body-4 line-clamp-2 h-[34px] leading-[17px]">
              {product.productName}
            </p>
            <p className="text-body-4 mt-0.5 font-semibold">
              {toNTCurrency(product.price)}
            </p>
          </Link>
        </li>
      ))}
    </ChatCardRail>
  );
}
