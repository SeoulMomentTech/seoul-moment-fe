import { useState } from "react";

import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomSheet } from "@shared/ui/bottom-sheet";
import { Touchable } from "@shared/ui/press";

import { Spacing } from "@/constants/theme";

/** 입력칸과 같은 높이. features/auth 의 AUTH_FIELD_HEIGHT 와 같은 값이어야 한 줄로 읽힌다. */
export const SELECT_FIELD_HEIGHT = 56;
// 목록 한 줄. body-2 한 줄(19) 위아래 16 — 44pt 터치 최소치를 넘긴다.
const OPTION_ROW_HEIGHT = 51;

// 테두리 색은 className 을 받지 못하는 자리라 토큰 값을 직접 쓴다.
const BORDER_IDLE = "#dddddd"; // --neutral-200 (= border-neutral-subtle)

export interface SelectOption {
  /** 서버에 저장되는 값. */
  value: string;
  /** 화면에 보이는 말. 값과 다를 수 있다(도시 이름은 저장은 중국어, 표시는 locale). */
  label: string;
}

interface SelectFieldProps {
  options: readonly SelectOption[];
  value?: string;
  onChange(next: string): void;
  /** 고르지 않았을 때 칸에 적히는 말. */
  placeholder: string;
  /** 시트 머리에 적히는 말. 보통 칸 라벨과 같다. */
  title: string;
  /** 앞 칸을 먼저 골라야 열 수 있는 칸(도시 없이 區를 고를 수 없다). */
  disabled?: boolean;
  /**
   * 고른 것을 다시 비울 수 있는 칸인지. 켜면 시트 맨 위에 "비우기" 줄이 선다.
   * 칩은 고른 것을 다시 눌러 비우지만 시트에는 그런 자리가 없어서, 비우는 길이
   * 필요한 칸(사이즈처럼 null 로 저장되는 것)은 이 줄 없이는 되돌릴 수 없다.
   */
  clearable?: boolean;
}

/**
 * 보기가 길거나 많아 칩 한 줄에 담기지 않는 값을 고르는 칸. 눌러서 바텀 시트를 열고
 * 목록에서 하나를 고른다 — 폼 안에서는 입력칸과 같은 높이·테두리를 써서
 * 글자를 치는 칸과 고르는 칸이 한 줄기로 읽히게 한다.
 *
 * 성별처럼 보기가 두세 개뿐이고 한 줄에 다 보이는 값은 ChipRow 가 낫다.
 * 그보다 많아지면 칩 줄이 폼을 가로로 흐르는 띠로 채워 어느 칸이 무엇인지 흐려지므로,
 * 고른 값만 한 줄로 보이는 이 칸을 쓴다(사이즈 네 칸이 그래서 여기로 왔다).
 */
export function SelectField({
  options,
  value,
  onChange,
  placeholder,
  title,
  disabled = false,
  clearable = false,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <>
      <Touchable
        accessibilityLabel={selected ? `${title}: ${selected.label}` : title}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        className="bg-surface-muted flex-row items-center justify-between rounded-lg px-5"
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={{
          height: SELECT_FIELD_HEIGHT,
          borderWidth: 1,
          borderColor: BORDER_IDLE,
          // 아직 고를 수 없는 칸은 잠긴 입력칸과 같은 흐림을 쓴다.
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <Text
          className={
            selected
              ? "text-body-2 text-foreground"
              : "text-body-2 text-neutral"
          }
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Text className="text-body-1 text-neutral">›</Text>
      </Touchable>
      <OptionSheet
        clearable={clearable}
        onClose={() => setOpen(false)}
        onSelect={(next) => {
          onChange(next);
          setOpen(false);
        }}
        options={options}
        title={title}
        value={value}
        visible={open}
      />
    </>
  );
}

function OptionSheet({
  visible,
  title,
  options,
  value,
  clearable,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: readonly SelectOption[];
  value?: string;
  clearable: boolean;
  onSelect(next: string): void;
  onClose(): void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <BottomSheet onClose={onClose} title={title} visible={visible}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.tight }}
        style={{ flexShrink: 1 }}
      >
        {options.length === 0 ? (
          <View className="px-5 pb-4">
            <Text className="text-body-3 text-neutral">
              Nothing to choose from yet.
            </Text>
          </View>
        ) : (
          <>
            {/* 비우는 줄은 맨 위에 둔다. 값이 없을 때는 비울 것도 없어 그리지 않는다. */}
            {clearable && value != null ? (
              <Touchable
                accessibilityLabel={`Clear ${title.toLowerCase()}`}
                accessibilityRole="button"
                className="border-neutral-subtle flex-row items-center border-b px-5"
                onPress={() => onSelect("")}
                style={{ height: OPTION_ROW_HEIGHT }}
              >
                <Text className="text-body-2 text-neutral">Not set</Text>
              </Touchable>
            ) : null}
            {options.map((option) => {
              const selected = option.value === value;

              return (
                <Touchable
                  accessibilityLabel={option.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  className="flex-row items-center justify-between px-5"
                  key={option.value}
                  onPress={() => onSelect(option.value)}
                  style={{ height: OPTION_ROW_HEIGHT }}
                >
                  <Text
                    className={
                      // 고른 것은 "지금 고른 것"이라 브랜드 색이다 — 정렬 시트와 같은 규칙.
                      selected
                        ? "text-body-2 text-brand font-bold"
                        : "text-body-2 text-foreground"
                    }
                  >
                    {option.label}
                  </Text>
                  {selected ? (
                    <Text className="text-body-2 text-brand">✓</Text>
                  ) : null}
                </Touchable>
              );
            })}
          </>
        )}
      </ScrollView>
    </BottomSheet>
  );
}
