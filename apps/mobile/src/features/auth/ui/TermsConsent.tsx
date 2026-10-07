import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Touchable } from "@shared/ui/press";

import { Spacing } from "@/constants/theme";

export type TermKey = "termsOfService" | "privacyPolicy";

const TERM_ITEMS: { key: TermKey; label: string; href: Href }[] = [
  { key: "termsOfService", label: "Terms of Service", href: "/terms" },
  { key: "privacyPolicy", label: "Privacy Policy", href: "/policy" },
];

const BOX_SIZE = 20;
const ROW_HEIGHT = 44;

export type TermsAgreed = Record<TermKey, boolean>;

export const NO_TERMS_AGREED: TermsAgreed = {
  termsOfService: false,
  privacyPolicy: false,
};

export const allTermsAgreed = (values: TermsAgreed) =>
  TERM_ITEMS.every(({ key }) => values[key]);

/**
 * 약관 동의. web TermsConsent 와 같은 구성이다 — "전체 동의" 한 줄 아래 항목별 줄,
 * 각 줄 오른쪽에 본문으로 가는 링크.
 * 동의 값은 서버로 보내지 않는다(가입 payload 에 그런 필드가 없다). 눌러서 읽었다는
 * 확인을 받고 가입 버튼을 여는 용도다 — web 도 같다.
 */
export function TermsConsent({
  values,
  onChange,
}: {
  values: TermsAgreed;
  onChange(next: TermsAgreed): void;
}) {
  const router = useRouter();
  const all = allTermsAgreed(values);

  return (
    <View>
      <Text className="text-body-3 text-neutral">
        Terms of Service &amp; Policies
      </Text>
      <View className="border-neutral-subtle border-b">
        <CheckRow
          checked={all}
          label="Agree to All"
          onToggle={() =>
            onChange({ termsOfService: !all, privacyPolicy: !all })
          }
        />
      </View>
      {TERM_ITEMS.map(({ key, label, href }) => (
        <CheckRow
          checked={values[key]}
          detailHref={href}
          key={key}
          label={label}
          onDetail={() => router.push(href)}
          onToggle={() => onChange({ ...values, [key]: !values[key] })}
        />
      ))}
    </View>
  );
}

function CheckRow({
  label,
  checked,
  onToggle,
  onDetail,
  detailHref,
}: {
  label: string;
  checked: boolean;
  onToggle(): void;
  onDetail?(): void;
  detailHref?: Href;
}) {
  return (
    <View
      className="flex-row items-center justify-between"
      style={{ height: ROW_HEIGHT }}
    >
      <Touchable
        accessibilityLabel={label}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        className="flex-1 flex-row items-center"
        onPress={onToggle}
        style={{ height: ROW_HEIGHT }}
      >
        <View
          className={
            checked
              ? "bg-foreground border-foreground items-center justify-center border"
              : "border-neutral-subtle items-center justify-center border"
          }
          style={{
            width: BOX_SIZE,
            height: BOX_SIZE,
            borderRadius: BOX_SIZE / 2,
            marginRight: Spacing.tight,
          }}
        >
          {/* 체크 글리프. 흰 글씨라 토큰 대신 text-background 를 쓴다. */}
          {checked ? (
            <Text className="text-body-5 text-background font-bold">✓</Text>
          ) : null}
        </View>
        <Text className="text-body-3 text-foreground">{label}</Text>
      </Touchable>
      {onDetail && detailHref ? (
        <Touchable
          accessibilityLabel={`${label} details`}
          accessibilityRole="button"
          className="flex-row items-center"
          onPress={onDetail}
          style={{ height: ROW_HEIGHT, paddingLeft: Spacing.tight }}
        >
          <Text className="text-body-3 text-neutral">Details ›</Text>
        </Touchable>
      ) : null}
    </View>
  );
}
