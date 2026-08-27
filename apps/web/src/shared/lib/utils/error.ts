import { isHTTPError, isTimeoutError } from "ky";

/**
 * 서버가 에러 응답 본문으로 내려주는 공통 shape.
 * swagger 의 4xx/5xx 응답이 모두 이 형태다.
 */
export interface ApiErrorBody {
  message?: string;
  code?: string;
  traceId?: string;
}

export interface ErrorInfo {
  /** 서버가 응답한 HTTP 에러인지. true 면 status 를 신뢰할 수 있다. */
  isHttp: boolean;
  /** ky 타임아웃인지. 응답 자체가 없어 status·본문이 없다. */
  isTimeout: boolean;
  status?: number;
  url?: string;
  /**
   * 사용자에게 보여줄 메시지.
   *
   * 없을 수 있다 — 그 경우 호출부가 자기 i18n 문구로 대체해야 한다.
   * 이 유틸은 번역되지 않은 문구를 만들어내지 않는다.
   */
  message?: string;
  code?: string;
  traceId?: string;
}

/** 빈 문자열은 메시지가 없는 것으로 취급한다. */
const toMessage = (error: unknown): string | undefined => {
  if (error instanceof Error) return error.message || undefined;
  if (typeof error === "string") return error || undefined;
  return undefined;
};

/**
 * 응답 본문을 읽지 않고 즉시 얻을 수 있는 정보만 추출한다.
 *
 * `message` 는 ky 가 만든 문구(`Request failed with status code 409: ...`)라
 * 사용자에게 보여줄 만하지 않다. 서버가 준 문구가 필요하면 readErrorInfo 를 쓴다.
 *
 * catch 블록은 `unknown` 을 주므로 어떤 값이 와도 던지지 않는다.
 */
export const getErrorInfo = (error: unknown): ErrorInfo => {
  if (isHTTPError(error)) {
    return {
      isHttp: true,
      isTimeout: false,
      status: error.response?.status,
      url: error.response?.url,
      message: toMessage(error),
    };
  }

  return {
    isHttp: false,
    isTimeout: isTimeoutError(error),
    message: toMessage(error),
  };
};

/**
 * 본문을 한 번만 읽을 수 있으므로 clone 해서 읽는다.
 * 호출부가 같은 응답을 다시 읽어도 문제 없게 남겨둔다.
 */
const readApiErrorBody = async (
  response: Response | undefined,
): Promise<ApiErrorBody | null> => {
  if (!response) return null;

  try {
    const data: unknown = await response.clone().json();
    if (!data || typeof data !== "object") return null;
    return data as ApiErrorBody;
  } catch {
    // 본문이 비었거나 JSON 이 아니다. 그것 자체는 오류가 아니다.
    return null;
  }
};

/**
 * 응답 본문까지 읽어 서버가 준 message·code·traceId 를 채운다.
 *
 * 서버 문구가 ky 의 기본 문구보다 구체적이므로 있으면 그것을 쓴다.
 * 본문을 읽을 수 없으면 getErrorInfo 와 같은 결과를 돌려준다.
 */
export const readErrorInfo = async (error: unknown): Promise<ErrorInfo> => {
  const info = getErrorInfo(error);
  if (!isHTTPError(error)) return info;

  const body = await readApiErrorBody(error.response);
  if (!body) return info;

  return {
    ...info,
    message: body.message ?? info.message,
    code: body.code,
    traceId: body.traceId,
  };
};
