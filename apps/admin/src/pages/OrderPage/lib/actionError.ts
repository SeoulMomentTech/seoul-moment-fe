import axios from "axios";

type StatusMessages = Partial<Record<400 | 403 | 404 | 409, string>>;

const FORBIDDEN_MESSAGE = "super_admin 관리자만 할 수 있습니다.";

/** 주문 작업 API 의 상태 코드별 안내. 모르는 실패는 fallback 을 쓴다 */
export const getOrderActionErrorMessage = (
  error: unknown,
  fallback: string,
  messages: StatusMessages = {},
) => {
  if (!axios.isAxiosError(error)) return fallback;

  const status = error.response?.status;
  if (status === 403) return messages[403] ?? FORBIDDEN_MESSAGE;
  if (status === 400 || status === 404 || status === 409) {
    return messages[status] ?? fallback;
  }

  return fallback;
};
