import { useRouter } from "expo-router";

import { useTranslations } from "@shared/lib/i18n/useTranslations";
import { Touchable } from "@shared/ui/press";
import { Section } from "@shared/ui/section";
import { SectionError } from "@shared/ui/section-state";
import { PostSlideSkeleton } from "@shared/ui/skeleton";
import { SlideCarousel } from "@shared/ui/slide-pager/SlideCarousel";

import { ArticleSlideCard } from "./PostSlideCards";
import { useHomeArticle } from "../model/useHomeLists";

export function ArticleSection() {
  const t = useTranslations();
  const router = useRouter();
  const {
    data: articles,
    isPending,
    isError,
    fetchStatus,
    refetch,
  } = useHomeArticle();

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다. 스켈레톤을 영원히
  // 돌리지 말고 재시도 줄을 보여준다.
  if (isPending && fetchStatus === "paused") {
    return (
      <Section title={t("article")}>
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  if (isPending) {
    return (
      <Section title={t("article")}>
        <PostSlideSkeleton variant="article" />
      </Section>
    );
  }

  if (isError) {
    return (
      <Section title={t("article")}>
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  if (!articles || articles.length === 0) return null;

  // 웹 홈과 같이 아티클에는 더보기를 두지 않는다 — 전체 목록 화면이 따로 없다.
  return (
    <Section title={t("article")}>
      <SlideCarousel
        data={articles}
        keyExtractor={(item) => String(item.id)}
        renderItem={(item) => (
          <Touchable
            accessibilityLabel={item.title}
            accessibilityRole="button"
            feedback="card"
            onPress={() => router.push(`/article/${item.id}`)}
          >
            <ArticleSlideCard
              content={item.content}
              createDate={item.createDate}
              imageUrl={item.homeImage}
              title={item.title}
              writer={item.writer}
            />
          </Touchable>
        )}
      />
    </Section>
  );
}
