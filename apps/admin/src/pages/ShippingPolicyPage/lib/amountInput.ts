import { formatNumber } from "@shared/utils/format";

/**
 * 금액 입력칸은 쉼표를 찍어 보여주므로 type="number" 를 쓰지 않는다.
 * 숫자만 남겨 정수로 읽고, 비었으면 null 로 둬 검증에서 걸리게 한다.
 */
export const parseAmountInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
};

export const formatAmountInput = (value: number | null) =>
  value === null ? "" : formatNumber(value);
