import { useState } from "react";

import { Platform, Text, View } from "react-native";

import { BottomSheet } from "@shared/ui/bottom-sheet";
import { Button } from "@shared/ui/button";
import { Touchable } from "@shared/ui/press";

import { Spacing } from "@/constants/theme";

import DateTimePicker from "@react-native-community/datetimepicker";

/** SelectField·AuthField 와 같은 높이여야 폼이 한 줄기로 읽힌다. */
export const DATE_FIELD_HEIGHT = 56;
// 테두리 색은 className 을 받지 못하는 자리라 토큰 값을 직접 쓴다.
const BORDER_IDLE = "#dddddd"; // --neutral-200 (= border-neutral-subtle)

interface DateFieldProps {
  /** YYYY-MM-DD. 빈 문자열이면 아직 고르지 않은 것이다. */
  value: string;
  onChange(next: string): void;
  placeholder: string;
  /** 시트 머리에 적히는 말. 보통 칸 라벨과 같다. */
  title: string;
  /** 고를 수 있는 가장 이른 날. 기본은 120년 전이다. */
  minimumDate?: Date;
  /** 고를 수 있는 가장 늦은 날. 기본은 오늘 — 태어나지 않은 날은 생일이 아니다. */
  maximumDate?: Date;
}

const pad = (n: number) => String(n).padStart(2, "0");

const toISODate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** 저장된 문자열을 Date 로. 깨진 값이면 null 이라 피커가 기본값에서 시작한다. */
const parseISODate = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, y, m, d] = match;
  // 로컬 시간 기준으로 만든다. Date(string) 은 UTC 로 읽어 하루가 어긋난다.
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * 날짜 한 칸. 눌러서 네이티브 피커를 열고 연·월·일을 한 번에 고른다.
 *
 * 세 칸에 숫자를 치게 하면 2월 31일 같은 날이 입력될 수 있어 막는 규칙이 따로 필요한데,
 * 피커는 달력에 없는 날을 애초에 보여 주지 않는다. 범위도 피커가 지킨다.
 *
 * iOS 의 피커는 제자리에 펼쳐지는 물건이라 폼 한가운데서 열면 아래가 통째로 밀린다.
 * 그래서 앱의 다른 "고르는 자리"와 같이 바텀 시트 안에 넣고 Done 으로 닫는다.
 * Android 는 운영체제가 제 대화상자를 띄우고 스스로 닫으므로 시트를 쓰지 않는다.
 */
export function DateField({
  value,
  onChange,
  placeholder,
  title,
  minimumDate,
  maximumDate,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = parseISODate(value);
  const today = new Date();
  const max = maximumDate ?? today;
  const min =
    minimumDate ??
    new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());

  // 고른 것이 없으면 피커는 고를 수 있는 가장 늦은 날에서 시작한다.
  const [draft, setDraft] = useState<Date>(selected ?? max);

  const openPicker = () => {
    // 열 때마다 지금 저장된 값에서 시작한다 — 지난번에 굴리다 만 자리가 아니라.
    setDraft(selected ?? max);
    setOpen(true);
  };

  return (
    <>
      <Touchable
        accessibilityLabel={value ? `${title}: ${value}` : title}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        className="bg-surface-muted flex-row items-center justify-between rounded-lg px-5"
        onPress={openPicker}
        style={{
          height: DATE_FIELD_HEIGHT,
          borderWidth: 1,
          borderColor: BORDER_IDLE,
        }}
      >
        <Text
          className={
            value ? "text-body-2 text-foreground" : "text-body-2 text-neutral"
          }
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Text className="text-body-1 text-neutral">›</Text>
      </Touchable>

      {Platform.OS === "ios" ? (
        <BottomSheet
          onClose={() => setOpen(false)}
          title={title}
          visible={open}
        >
          <View className="items-center px-5">
            <DateTimePicker
              display="spinner"
              maximumDate={max}
              minimumDate={min}
              mode="date"
              onChange={(_event, next) => {
                if (next) setDraft(next);
              }}
              value={draft}
            />
          </View>
          <View className="px-5" style={{ paddingBottom: Spacing.inner }}>
            <Button
              label="Done"
              onPress={() => {
                onChange(toISODate(draft));
                setOpen(false);
              }}
            />
          </View>
        </BottomSheet>
      ) : open ? (
        <DateTimePicker
          display="default"
          maximumDate={max}
          minimumDate={min}
          mode="date"
          onChange={(event, next) => {
            // Android 의 대화상자는 한 번 고르면 끝난다. 취소면 값을 건드리지 않는다.
            setOpen(false);
            if (event.type === "set" && next) onChange(toISODate(next));
          }}
          value={draft}
        />
      ) : null}
    </>
  );
}
