import { Text, View } from "react-native";

/**
 * 법무 문서 트리. apps/web 의 legal-document 프리미티브(LegalDocument/Section/
 * SubSection/Paragraph/Bullets)와 1:1 로 대응한다.
 */
export type LegalNode =
  | { t: "doc"; title: string; children: LegalNode[] }
  | { t: "section"; title: string; children: LegalNode[] }
  | { t: "sub"; title?: string; children: LegalNode[] }
  | { t: "p"; text: string }
  | { t: "bullets"; items: string[] };

// 웹과 같은 세로 리듬. doc 32 / section 12 / section 본문 16 / sub 6.
const DOC_GAP = 32;
const SECTION_GAP = 12;
const SECTION_BODY_GAP = 16;
const SUB_GAP = 6;
const BULLET_GAP = 4;
const BODY_LINE_HEIGHT = 24;

/** 문서 한 그루를 통째로 그린다. 바깥 여백과 스크롤은 화면이 책임진다. */
export function LegalDocument({ node }: { node: LegalNode }) {
  if (node.t !== "doc") return null;

  return (
    <View style={{ gap: DOC_GAP }}>
      <Text className="text-title-4 text-foreground font-semibold">
        {node.title}
      </Text>
      {node.children.map((child, index) => (
        // 정적 문서라 순서가 바뀌지 않으므로 index 키가 안전하다.
        // eslint-disable-next-line react/no-array-index-key
        <LegalBlock key={index} node={child} />
      ))}
    </View>
  );
}

function LegalBlock({ node }: { node: LegalNode }) {
  if (node.t === "p") {
    return (
      <Text
        className="text-body-3 text-neutral"
        style={{ lineHeight: BODY_LINE_HEIGHT }}
      >
        {node.text}
      </Text>
    );
  }

  if (node.t === "bullets") {
    return (
      <View style={{ gap: BULLET_GAP }}>
        {node.items.map((item) => (
          <View className="flex-row" key={item}>
            {/* RN 에는 list-disc 가 없어 글머리표를 직접 그린다. 들여쓰기는 웹 pl-5 와 같다. */}
            <Text
              className="text-body-3 text-neutral"
              style={{ lineHeight: BODY_LINE_HEIGHT, width: 20 }}
            >
              {"•"}
            </Text>
            <Text
              className="text-body-3 text-neutral flex-1"
              style={{ lineHeight: BODY_LINE_HEIGHT }}
            >
              {item}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  if (node.t === "section") {
    return (
      <View style={{ gap: SECTION_GAP }}>
        <Text className="text-body-1 text-foreground font-semibold">
          {node.title}
        </Text>
        <View style={{ gap: SECTION_BODY_GAP }}>
          {node.children.map((child, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <LegalBlock key={index} node={child} />
          ))}
        </View>
      </View>
    );
  }

  if (node.t === "sub") {
    return (
      <View style={{ gap: SUB_GAP }}>
        {node.title ? (
          <Text className="text-body-2 text-foreground font-medium">
            {node.title}
          </Text>
        ) : null}
        {node.children.map((child, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <LegalBlock key={index} node={child} />
        ))}
      </View>
    );
  }

  return null;
}
