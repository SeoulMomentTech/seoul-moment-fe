import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * dev / live 빌드를 나눈다. 정적인 값은 app.json 에 두고, 빌드마다 달라지는 값만 여기서 덮어쓴다.
 *
 * APP_VARIANT 는 eas.json 의 빌드 프로필이 넣는다. 값이 없으면 live 로 본다 — 지금의 로컬
 * `expo run:*` 결과(패키지명·scheme)가 그대로 유지된다. 로컬에서 dev 앱을 만들려면
 * `APP_VARIANT=development npx expo run:android` 처럼 직접 넘긴다.
 *
 * dev 는 package / bundleIdentifier 가 달라서 한 기기에 live 앱과 함께 설치된다.
 */
const IS_DEV = process.env.APP_VARIANT === "development";

const APP_ID = "tw.com.seoulmoment.app";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IS_DEV ? "Seoul Moment (Dev)" : "Seoul Moment",
  slug: "seoul-moment",
  scheme: IS_DEV ? "seoulmoment-dev" : "seoulmoment",
  ios: {
    ...config.ios,
    bundleIdentifier: IS_DEV ? `${APP_ID}.dev` : APP_ID,
  },
  android: {
    ...config.android,
    package: IS_DEV ? `${APP_ID}.dev` : APP_ID,
  },
});
