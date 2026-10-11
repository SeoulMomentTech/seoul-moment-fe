/**
 * LINE 에서 id_token 한 장을 받아 오는 계층. 이것만 provider 별로 다르고,
 * 그 뒤(응답 판정·연결·가입)는 전부 공통이다.
 *
 * 네이티브 SDK 라 **Expo Go 에서는 동작하지 않는다**(dev build 필요). 그래서 모듈을
 * 맨 위에서 import 하지 않고 누를 때 가져온다 — 위에서 끌어오면 LINE 과 아무 상관 없는
 * 화면까지 Expo Go 에서 함께 죽는다.
 */

import Constants, { ExecutionEnvironment } from "expo-constants";

// 값이 아니라 타입만 가져온다. import type 은 번들에서 지워지므로 Expo Go 에서도 안전하다.
import type * as LineModule from "@xmartlabs/react-native-line";

/**
 * Expo Go 인지. 여기서는 모듈을 **불러 보지도 않는다** —
 * NativeLineLogin 은 평가되는 순간 TurboModuleRegistry.getEnforcing 으로 던지는데,
 * 그 던짐이 import() 를 감싼 try/catch 를 빠져나가 LogBox 를 띄운다(실제로 그랬다).
 * 그래서 잡는 대신 아예 닿지 않는다.
 */
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/** LINE Developers Console 의 채널 ID. 채널 시크릿은 쓰지 않는다. */
export const LINE_CHANNEL_ID = process.env.EXPO_PUBLIC_LINE_CHANNEL_ID;

/**
 * 버튼을 그릴지. 채널 ID 가 없으면 눌러도 끝까지 갈 수 없으므로 아예 그리지 않는다 —
 * 웹도 LIFF ID 가 없으면 LINE 버튼을 숨긴다.
 */
export const isLineLoginConfigured = Boolean(LINE_CHANNEL_ID);

/** SDK 가 없는 환경(Expo Go)에서 눌렀을 때. 호출부가 문구를 달리한다. */
export class LineUnavailableError extends Error {
  constructor() {
    super("LINE sign-in needs a development build");
    this.name = "LineUnavailableError";
  }
}

/** 로그인은 됐는데 id_token 이 없을 때. openid 스코프가 빠지면 이렇게 된다. */
export class LineNoIdTokenError extends Error {
  constructor() {
    super("LINE returned no id_token");
    this.name = "LineNoIdTokenError";
  }
}

let ready = false;

/**
 * 동의 화면에서 받을 것. **email 은 요청하지 않는다** — LINE 채널 승인을 따로 받아야
 * 하는 스코프라, 승인 전에 요청하면 동의 화면 자체가 실패한다. 이메일이 없으면 서버가
 * needsEmail 로 알려 주고 앱이 직접 받아 인증한다(그 갈래는 이미 구현돼 있다).
 * 채널에 email 승인이 떨어지면 아래 scopes 에 Scope.Email 을 더하면 된다.
 */

/**
 * 로그인 창을 띄우고 id_token 을 돌려준다. LINE 앱이 깔려 있으면 그쪽으로, 아니면
 * 브라우저로 넘어간다 — 어느 쪽인지는 SDK 가 알아서 고른다.
 */
export const requestLineIdToken = async (): Promise<string> => {
  if (!LINE_CHANNEL_ID || isExpoGo) throw new LineUnavailableError();

  let line: typeof LineModule;
  try {
    // Scope 는 진짜 enum 이라 값으로 들고 와야 한다. 같이 가져온다.
    line = await import("@xmartlabs/react-native-line");
    if (!ready) {
      await line.default.setup({ channelId: LINE_CHANNEL_ID });
      ready = true;
    }
  } catch {
    // 네이티브 쪽이 없다는 뜻이다. 사용자의 잘못이 아니므로 그렇게 말한다.
    // dev build 인데도 못 찾는 경우(설치 직후 네이티브가 안 붙음 등).
    throw new LineUnavailableError();
  }

  const result = await line.default.login({
    scopes: [line.Scope.Profile, line.Scope.OpenId],
  });
  const idToken = result.accessToken.idToken;

  if (!idToken) throw new LineNoIdTokenError();

  return idToken;
};
