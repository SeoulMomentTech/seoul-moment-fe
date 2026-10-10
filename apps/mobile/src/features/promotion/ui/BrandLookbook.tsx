import { Image } from "expo-image";
import { View } from "react-native";

import type {
  BrandPromotionSection,
  BrandSectionType,
} from "@shared/services/brandPromotion";
import { Section } from "@shared/ui/section";

import { Spacing } from "@/constants/theme";

/**
 * 묶음 종류별 이미지 한 장의 높이. 웹 ImageContents 의 max-sm 값이다 —
 * 데스크톱 값(944/644/530)은 폰에서 한 장이 화면 두 개를 먹는다.
 *
 * TYPE_4 는 웹에서 288 폭으로 왼쪽에 치우쳐 서지만, 폰에서 좌우 여백 20 을 빼면
 * 350 이라 288 을 고집할 이유가 없다. 전체 폭으로 펴고 높이만 웹 값을 쓴다.
 */
const SECTION_IMAGE_HEIGHT: Record<BrandSectionType, number> = {
  TYPE_1: 540,
  TYPE_2: 218,
  TYPE_3: 120,
  TYPE_4: 220,
  TYPE_5: 261,
};

/** 한 묶음이 쓰는 이미지 장수. 웹과 같게 자른다. */
const SECTION_IMAGE_COUNT: Record<BrandSectionType, number> = {
  TYPE_1: 1,
  TYPE_2: 2,
  TYPE_3: 4,
  TYPE_4: 1,
  TYPE_5: 1,
};

/** 묶음과 묶음 사이. 웹 모바일은 60 이지만 이 앱의 세로 리듬에는 그 값이 없다. */
export const LOOKBOOK_GAP = Spacing.section;

const isKnownType = (type: string): type is BrandSectionType =>
  type in SECTION_IMAGE_HEIGHT;

/**
 * 룩북 묶음 하나. 여러 장인 종류(TYPE_2 둘, TYPE_3 넷)는 웹과 같이 가로로 나란히 세운다 —
 * 웹의 HStack 은 폰에서도 행을 유지하고 gap 만 0 으로 줄인다. 그래서 TYPE_3 의 한 장은
 * 폰에서 화면 폭의 1/4 이 되는데, 높이 120 과 함께 보면 그것이 의도된 띠 모양이다.
 */
function LookbookGroup({ section }: { section: BrandPromotionSection }) {
  // 모르는 종류는 아무것도 그리지 않는다(웹 SwitchCase 의 defaultComponent={null} 과 같다).
  // 호출부가 미리 걸러내므로 여기까지 오지 않지만, 혼자 써도 안전하도록 둔다.
  if (!isKnownType(section.type)) return null;

  const uris = section.imageUrlList.slice(0, SECTION_IMAGE_COUNT[section.type]);

  if (uris.length === 0) return null;

  return (
    // 한 장짜리도 같은 행에 담는다 — flex-1 이 한 칸이면 폭 전체가 되어 결과가 같다.
    <View className="flex-row">
      {uris.map((uri, index) => (
        <Image
          contentFit="cover"
          // 정적 목록이라 순서가 바뀌지 않으므로 index 키가 안전하다.
          // eslint-disable-next-line react/no-array-index-key
          key={`${index}-${uri}`}
          source={uri}
          // 웹의 flex-1 과 같다. 장수로 나눈 폭을 각자 가진다.
          style={{ flex: 1, height: SECTION_IMAGE_HEIGHT[section.type] }}
          transition={200}
        />
      ))}
    </View>
  );
}

/**
 * 룩북. 제목 없는 회색 띠 위에 사진 묶음만 쌓는다 — 웹도 여기에 제목을 두지 않는다.
 * 사진이 이 화면의 주인공이라 좌우 여백 없이 화면 끝까지 흘린다.
 *
 * 모르는 묶음 종류는 그리기 전에 걸러낸다. 걸러내지 않고 묶음 안에서 null 을 돌려주면
 * 사이 간격(40)만 남아 "사진이 안 뜬 자리"처럼 보인다.
 */
export function BrandLookbook({
  sectionList,
}: {
  sectionList: BrandPromotionSection[];
}) {
  const groups = sectionList.filter(
    (section) => isKnownType(section.type) && section.imageUrlList.length > 0,
  );

  if (groups.length === 0) return null;

  return (
    <Section tone="muted">
      <View style={{ gap: LOOKBOOK_GAP }}>
        {groups.map((section) => (
          <LookbookGroup key={section.id} section={section} />
        ))}
      </View>
    </Section>
  );
}
