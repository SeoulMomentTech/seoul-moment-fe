export const getIsWebview = () => {
  const isApp =
    typeof window !== "undefined" &&
    (window.__IS_SEOUL_MOMENT_APP__ === true || !!window.ReactNativeWebView);

  return isApp;
};
