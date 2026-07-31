import type { ProductItem } from "@shared/services/product";

import type {
  ChatContentRef,
  ChatIntent,
  ChatMessage,
  QuickReply,
} from "../model/types";

/*
 * 실 대화 API 가 붙으면 이 파일은 삭제된다. 그때 렌더러를 손대지 않으려면
 * mock 이 **실 응답과 완전히 같은 shape** 을 내야 한다 — 그래서 상품 픽스처는
 * @shared/services/product 의 ProductItem 인터페이스를 전 필드 채워 만든다.
 *
 * 답변 문장은 리터럴이 아니라 textKey 로만 싣는다. 덕분에 이 모듈은 i18n 을
 * 전혀 모르고, 저장된 대화가 로케일 전환 후에도 올바른 언어로 보인다.
 */

/**
 * 시연용 상품 데이터. 실제 상품이 아니다.
 *
 * 이미지는 앱 자체 플레이스홀더를 쓴다. next.config.ts 의 remotePatterns 가
 * images.unsplash.com / image-dev.seoulmoment.com.tw / www.figma.com 만
 * 허용하는데, 검증되지 않은 외부 URL 을 박으면 깨진 이미지가 되기 때문이다.
 * 실 API 연결 시 이 배열 전체가 사라진다.
 */
const DEMO_THUMBNAIL = "/default-image.svg";

const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: 90001,
    brandName: "NOUN PROJECT",
    productName: "Oversized Wool Coat",
    price: 189000,
    like: 128,
    review: 34,
    reviewAverage: 4.6,
    image: DEMO_THUMBNAIL,
    colorName: "Camel",
    colorCode: "#c19a6b",
    isLiked: false,
  },
  {
    id: 90002,
    brandName: "SEORAE",
    productName: "Brushed Cotton Shirt",
    price: 79000,
    like: 86,
    review: 21,
    reviewAverage: 4.4,
    image: DEMO_THUMBNAIL,
    colorName: "Ivory",
    colorCode: "#f2ece1",
    isLiked: false,
  },
  {
    id: 90003,
    brandName: "HANOK STUDIO",
    productName: "Structured Leather Tote",
    price: 246000,
    like: 203,
    review: 57,
    reviewAverage: 4.8,
    image: DEMO_THUMBNAIL,
    colorName: "Deep Brown",
    colorCode: "#4a3728",
    isLiked: false,
  },
];

/** 시연용 콘텐츠 데이터. 실제 아티클이 아니다. */
const MOCK_CONTENTS: ChatContentRef[] = [
  {
    id: 80001,
    resource: "magazine",
    title: "가을 서울, 레이어링의 기술",
    thumbnail: DEMO_THUMBNAIL,
    category: "STYLE",
  },
  {
    id: 80002,
    resource: "news",
    title: "새로 합류한 브랜드 셋",
    thumbnail: DEMO_THUMBNAIL,
    category: "BRAND",
  },
  {
    id: 80003,
    resource: "magazine",
    title: "만드는 사람들: 가죽 공방의 하루",
    thumbnail: DEMO_THUMBNAIL,
    category: "PEOPLE",
  },
];

const QUICK_REPLIES = {
  afterProducts: [
    {
      id: "q-more-products",
      labelKey: "chatbot_quick_more_products",
      intent: "product_recommend",
    },
    {
      id: "q-shipping-fee",
      labelKey: "chatbot_quick_shipping_fee",
      intent: "shipping_info",
    },
  ],
  afterOrder: [
    {
      id: "q-order-status",
      labelKey: "chatbot_quick_order_status",
      intent: "order_status",
    },
    {
      id: "q-contact-human",
      labelKey: "chatbot_quick_contact_human",
      intent: "unknown",
    },
  ],
  afterShipping: [
    {
      id: "q-order-status-2",
      labelKey: "chatbot_quick_order_status",
      intent: "order_status",
    },
    {
      id: "q-contact-human-2",
      labelKey: "chatbot_quick_contact_human",
      intent: "unknown",
    },
  ],
  afterContent: [
    {
      id: "q-more-products-2",
      labelKey: "chatbot_quick_more_products",
      intent: "product_recommend",
    },
  ],
  fallback: [
    {
      id: "q-fb-product",
      labelKey: "chatbot_suggestion_product",
      intent: "product_recommend",
    },
    {
      id: "q-fb-order",
      labelKey: "chatbot_suggestion_order",
      intent: "order_status",
    },
    {
      id: "q-fb-content",
      labelKey: "chatbot_suggestion_content",
      intent: "content_discover",
    },
  ],
} satisfies Record<string, QuickReply[]>;

/*
 * 로케일별 키워드 표. 부실한 게 정상이고, 그래서 칩이 1차 어포던스다.
 * 순서가 중요하다 — shipping_info 가 order_status 보다 먼저 평가되어야
 * "배송비"가 "배송"에 먹히지 않는다.
 */
const INTENT_KEYWORDS: Array<{ intent: ChatIntent; keywords: string[] }> = [
  {
    intent: "shipping_info",
    keywords: [
      "배송비",
      "해외",
      "국제",
      "관세",
      "shipping fee",
      "international",
      "customs",
      "運費",
      "國際",
      "關稅",
    ],
  },
  {
    intent: "order_status",
    keywords: [
      "주문",
      "배송",
      "택배",
      "언제 와",
      "도착",
      "order",
      "delivery",
      "arrive",
      "track",
      "訂單",
      "配送",
      "到貨",
    ],
  },
  {
    intent: "content_discover",
    keywords: [
      "콘텐츠",
      "매거진",
      "아티클",
      "읽을",
      "뉴스",
      "이야기",
      "magazine",
      "article",
      "read",
      "news",
      "story",
      "內容",
      "雜誌",
      "文章",
    ],
  },
  {
    intent: "product_recommend",
    keywords: [
      "추천",
      "상품",
      "옷",
      "아우터",
      "코트",
      "가방",
      "셔츠",
      "recommend",
      "product",
      "outfit",
      "coat",
      "bag",
      "shirt",
      "推薦",
      "商品",
      "外套",
      "包",
    ],
  },
];

export const classifyIntent = (message: string): ChatIntent => {
  const haystack = message.toLowerCase();
  const match = INTENT_KEYWORDS.find(({ keywords }) =>
    keywords.some((keyword) => haystack.includes(keyword.toLowerCase())),
  );

  return match?.intent ?? "unknown";
};

interface MockReplyInput {
  message: string;
  /** 칩에서 온 턴이면 그 의도를 그대로 통과시켜 결정적으로 만든다. */
  intent?: ChatIntent;
  createId(): string;
  now(): number;
}

export const resolveMockReply = ({
  createId,
  intent,
  message,
  now,
}: MockReplyInput): ChatMessage[] => {
  const resolved = intent ?? classifyIntent(message);
  const base = { id: createId(), createdAt: now() };

  switch (resolved) {
    case "product_recommend":
      return [
        {
          ...base,
          type: "assistant_products",
          textKey: "chatbot_reply_product",
          products: MOCK_PRODUCTS,
          quickReplies: QUICK_REPLIES.afterProducts,
        },
      ];

    case "content_discover":
      return [
        {
          ...base,
          type: "assistant_contents",
          textKey: "chatbot_reply_content",
          contents: MOCK_CONTENTS,
          quickReplies: QUICK_REPLIES.afterContent,
        },
      ];

    case "order_status":
      return [
        {
          ...base,
          type: "assistant_text",
          textKey: "chatbot_reply_order",
          quickReplies: QUICK_REPLIES.afterOrder,
        },
      ];

    case "shipping_info":
      return [
        {
          ...base,
          type: "assistant_text",
          textKey: "chatbot_reply_shipping",
          quickReplies: QUICK_REPLIES.afterShipping,
        },
      ];

    default:
      return [
        {
          ...base,
          type: "assistant_text",
          textKey: "chatbot_reply_fallback",
          quickReplies: QUICK_REPLIES.fallback,
        },
      ];
  }
};
