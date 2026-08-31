import type { Metadata } from "next";
import * as rootParams from "next/root-params";

import { buildLocalizedAlternates } from "@/i18n/metadata";

import { HomePage } from "@views/home";

// 홈은 동적 API를 쓰지 않아 빌드 타임에 프리렌더된다. revalidate가 없으면
// 배너·프로모션·상품·뉴스·아티클이 재배포 전까지 빌드 시점 응답으로 고정되므로
// ISR을 명시한다. 상세 페이지(news/article)의 1800보다 짧게 잡은 이유는 홈의
// 배너/프로모션이 어드민에서 더 자주 교체되기 때문.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await rootParams.locale();

  return {
    alternates: buildLocalizedAlternates(locale, ""),
  };
}

export default function Home() {
  return <HomePage />;
}
