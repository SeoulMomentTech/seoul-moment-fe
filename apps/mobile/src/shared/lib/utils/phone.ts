/** 대만 국가 번호. 서버는 국가 코드가 붙은 번호만 받는다. */
export const TAIWAN_DIAL_CODE = "+886";

/**
 * 사람이 친 번호를 서버가 받는 꼴로 바꾼다. web 의 toTaiwanPhoneNumber 와 같은 규칙이다 —
 * 두 곳이 다르게 정규화하면 같은 번호가 계정마다 다른 문자열로 저장된다.
 *
 * 숫자만 남기고, 앞의 국가 번호(886)와 국내 통화용 0 을 떼고 다시 +886 을 붙인다.
 * "0912-345-678" / "912345678" / "+886912345678" 이 모두 "+886912345678" 이 된다.
 */
export const toTaiwanPhoneNumber = (input: string): string => {
  const digits = input
    .replace(/\D/g, "")
    .replace(/^886/, "")
    .replace(/^0+/, "");

  return `${TAIWAN_DIAL_CODE}${digits}`;
};
