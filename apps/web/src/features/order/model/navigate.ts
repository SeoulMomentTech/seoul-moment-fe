/**
 * 같은 탭으로 외부 페이지(ECPay 전자지도)에 간다.
 *
 * `window.location.assign` 을 바로 부르지 않고 한 겹 두는 것은 jsdom 의 `location` 이
 * 재정의 불가라 테스트에서 가로챌 수 없기 때문이다. 떠나는 순간을 한 곳에 모아 두면
 * 나중에 LINE 인앱용 분기(`?openExternalBrowser=1`)도 여기서 끝난다.
 */
export const navigateTo = (url: string) => {
  window.location.assign(url);
};
