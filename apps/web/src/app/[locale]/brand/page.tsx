import type { Metadata } from "next";

// 브랜드 목록은 아직 구현되지 않은 빈 화면이므로, 루트 메타데이터를 상속해
// 홈과 중복 색인(soft-404)되지 않도록 크롤러에서 제외한다.
export function generateMetadata(): Metadata {
  return {
    robots: { index: false, follow: false },
  };
}

export default function BrandPage() {
  return <></>;
}
