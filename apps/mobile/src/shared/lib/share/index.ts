import { Platform, Share } from "react-native";

/**
 * 웹 사이트 주소. 공유할 수 있는 주소는 이것뿐이다 — 앱의 딥링크(seoulmoment://)는
 * 앱이 깔린 기기에서만 열려서, 받은 사람이 못 여는 링크가 된다.
 * dev 응답의 배너 linkUrl 도 이 주소를 가리킨다.
 */
export const WEB_BASE_URL =
  process.env.EXPO_PUBLIC_WEB_BASE_URL ?? "https://seoulmoment.com.tw";

interface ShareWebLinkParams {
  /** 공유 시트에 함께 실리는 한 줄. 보통 화면의 이름이다. */
  title: string;
  /** 웹 주소의 뒷부분. 로케일 조각까지 포함해서 넘긴다(예: /en/promotion/7/brand/6). */
  path: string;
}

/**
 * 기기의 공유 시트를 연다. 웹은 "링크 복사" 하나뿐인 모달을 띄우지만, 폰에는 복사도
 * 메시지도 다른 앱으로 보내기도 들어 있는 시트가 이미 있다.
 *
 * Android 의 Share 는 url 을 읽지 않으므로 글 안에 붙여 보낸다. 사용자가 그냥 닫은 것은
 * 오류가 아니라 resolve 로 돌아오고, 시트를 열지 못한 경우는 시트 쪽이 말한다 —
 * 어느 쪽도 이 화면을 깨뜨리지 않는다.
 */
export const shareWebLink = async ({ title, path }: ShareWebLinkParams) => {
  const url = `${WEB_BASE_URL}${path}`;

  try {
    await Share.share(
      Platform.OS === "ios"
        ? { message: title, url }
        : { message: `${title}\n${url}` },
    );
  } catch {
    // 공유는 곁다리 동작이라 실패해도 화면은 그대로 둔다.
  }
};
