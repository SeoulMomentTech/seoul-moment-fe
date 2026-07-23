// AdSense 퍼블리셔 ID. 기본값은 public/ads.txt에 선언된 값과 동일하며,
// 필요 시 NEXT_PUBLIC_ADSENSE_CLIENT 로 override 할 수 있다.
export const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-1632733390772298";

// 뉴스 상세 본문 인아티클 광고 슬롯(data-ad-slot).
// 기본값은 AdSense 대시보드에서 발급받은 인아티클 유닛 슬롯 ID이며,
// 필요 시 NEXT_PUBLIC_ADSENSE_NEWS_IN_ARTICLE_SLOT 로 override 할 수 있다.
export const NEWS_IN_ARTICLE_AD_SLOT =
  process.env.NEXT_PUBLIC_ADSENSE_NEWS_IN_ARTICLE_SLOT ?? "3718790672";

// 아티클 상세 본문 인아티클 광고 슬롯(data-ad-slot).
// 기본값은 AdSense 대시보드에서 발급받은 아티클 전용 인아티클 유닛 슬롯 ID이며,
// 필요 시 NEXT_PUBLIC_ADSENSE_ARTICLE_IN_ARTICLE_SLOT 로 override 할 수 있다.
export const ARTICLE_IN_ARTICLE_AD_SLOT =
  process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_IN_ARTICLE_SLOT ?? "4519635408";
