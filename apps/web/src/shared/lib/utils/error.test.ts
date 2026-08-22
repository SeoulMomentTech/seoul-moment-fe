import { describe, expect, it } from "vitest";

import { getErrorInfo, readErrorInfo } from "./error";

/**
 * ky 의 isHTTPError·isTimeoutError 는 `error.name` 폴백을 가지고 있어,
 * 실제 Request 를 만들지 않고도 같은 분기를 태울 수 있다.
 */
const httpError = ({
  status,
  body,
  url = "https://api.test/user/auth/line/signup",
  message = `Request failed with status code ${status}`,
}: {
  status: number;
  body?: string;
  url?: string;
  message?: string;
}) => {
  const response = new Response(body, {
    status,
    headers: { "content-type": "application/json" },
  });
  // Response 는 url 이 읽기 전용이라 정의로 덮는다.
  Object.defineProperty(response, "url", { value: url });

  const error = new Error(message);
  error.name = "HTTPError";
  return Object.assign(error, { response });
};

const timeoutError = () => {
  const error = new Error("Request timed out");
  error.name = "TimeoutError";
  return error;
};

describe("getErrorInfo", () => {
  it("HTTP 에러에서 status와 url을 꺼낸다", () => {
    const info = getErrorInfo(httpError({ status: 409 }));

    expect(info.isHttp).toBe(true);
    expect(info.isTimeout).toBe(false);
    expect(info.status).toBe(409);
    expect(info.url).toBe("https://api.test/user/auth/line/signup");
  });

  it("본문은 읽지 않으므로 code·traceId가 없다", () => {
    const info = getErrorInfo(
      httpError({ status: 409, body: JSON.stringify({ code: "CONFLICT" }) }),
    );

    expect(info.code).toBeUndefined();
    expect(info.traceId).toBeUndefined();
  });

  it("타임아웃을 HTTP 에러와 구분한다", () => {
    const info = getErrorInfo(timeoutError());

    expect(info.isHttp).toBe(false);
    expect(info.isTimeout).toBe(true);
    expect(info.status).toBeUndefined();
  });

  it("일반 Error의 message를 가져온다", () => {
    expect(getErrorInfo(new Error("boom")).message).toBe("boom");
  });

  it("문자열이 던져진 경우도 message로 받는다", () => {
    expect(getErrorInfo("boom").message).toBe("boom");
  });

  it("message가 빈 문자열이면 없는 것으로 본다", () => {
    // 호출부가 `?? t("...")` 로 대체할 수 있어야 한다.
    expect(getErrorInfo(new Error("")).message).toBeUndefined();
  });

  it("Error가 아닌 값에도 던지지 않는다", () => {
    for (const value of [null, undefined, 0, {}, []]) {
      const info = getErrorInfo(value);
      expect(info.isHttp).toBe(false);
      expect(info.message).toBeUndefined();
    }
  });
});

describe("readErrorInfo", () => {
  it("서버가 준 message·code·traceId로 채운다", async () => {
    const info = await readErrorInfo(
      httpError({
        status: 409,
        body: JSON.stringify({
          message: "이미 가입된 이메일입니다.",
          code: "CONFLICT",
          traceId: "1827340b",
        }),
      }),
    );

    expect(info.status).toBe(409);
    expect(info.message).toBe("이미 가입된 이메일입니다.");
    expect(info.code).toBe("CONFLICT");
    expect(info.traceId).toBe("1827340b");
  });

  it("서버 message가 ky의 기본 문구를 대체한다", async () => {
    const error = httpError({
      status: 401,
      body: JSON.stringify({ message: "인증 코드가 일치하지 않습니다." }),
      message: "Request failed with status code 401",
    });

    expect(getErrorInfo(error).message).toBe(
      "Request failed with status code 401",
    );
    expect((await readErrorInfo(error)).message).toBe(
      "인증 코드가 일치하지 않습니다.",
    );
  });

  it("본문을 읽어도 원래 응답은 그대로 읽을 수 있다", async () => {
    // clone 하지 않으면 호출부가 같은 본문을 다시 읽지 못한다.
    const error = httpError({
      status: 400,
      body: JSON.stringify({ message: "잘못된 요청" }),
    });

    await readErrorInfo(error);

    await expect(error.response.json()).resolves.toEqual({
      message: "잘못된 요청",
    });
  });

  it("본문이 JSON이 아니면 동기 결과를 그대로 돌려준다", async () => {
    const error = httpError({ status: 502, body: "<html>bad gateway</html>" });

    const info = await readErrorInfo(error);

    expect(info.status).toBe(502);
    expect(info.message).toBe("Request failed with status code 502");
    expect(info.code).toBeUndefined();
  });

  it("본문이 비어도 던지지 않는다", async () => {
    const info = await readErrorInfo(httpError({ status: 500 }));

    expect(info.status).toBe(500);
    expect(info.code).toBeUndefined();
  });

  it("서버 message가 없으면 기존 message를 유지한다", async () => {
    const info = await readErrorInfo(
      httpError({
        status: 409,
        body: JSON.stringify({ code: "CONFLICT" }),
        message: "Request failed with status code 409",
      }),
    );

    expect(info.message).toBe("Request failed with status code 409");
    expect(info.code).toBe("CONFLICT");
  });

  it("HTTP 에러가 아니면 본문을 읽지 않고 그대로 돌려준다", async () => {
    const info = await readErrorInfo(timeoutError());

    expect(info.isTimeout).toBe(true);
    expect(info.message).toBe("Request timed out");
  });
});
