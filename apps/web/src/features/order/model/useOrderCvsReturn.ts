"use client";

import { useEffect, useRef, useState } from "react";

import { parseAsString, useQueryState } from "nuqs";

import { useRouter } from "@/i18n/navigation";

import { toOrderHref, type OrderSource } from "@entities/order";

import { peekOrderDraft, saveOrderDraft } from "./orderDraft";

/**
 * 전자지도에서 `/order?cvsStoreToken=x` 로 돌아왔을 때의 처리. 마운트 뒤 한 번만 돈다.
 *
 * 복귀 주소에는 주문 대상이 없다(쿼리 없는 주소만 서버에 넘긴다). 그래서 draft 가 들고 있는
 * `sourceHref` 로 원래 주문서에 되돌아가고, 토큰은 URL 이 아니라 draft 에 옮겨 둔다 —
 * 새로고침·뒤로가기로 토큰이 다시 흘러들지 않게 하려는 것이다.
 *
 * - draft 가 있으면 토큰을 `cvs.storeToken` 에 넣어 다시 저장한다. 현재 URL 의 주문 대상이
 *   draft 와 다르면 `router.replace(sourceHref)`, 같으면 토큰 쿼리만 지운다.
 * - draft 가 없으면(만료·저장 실패·다른 탭) 토큰만 지운다. 주문 대상이 없으니 기존
 *   "주문할 것이 없음" 화면이 뜬다.
 */
export const useOrderCvsReturn = (source: OrderSource | null) => {
  const router = useRouter();
  const [token, setToken] = useQueryState("cvsStoreToken", parseAsString);
  // 옮겨 가는 목적지. 같은 라우트 안에서 쿼리만 바뀌므로 훅은 다시 마운트되지 않는다 —
  // 불리언으로 들고 있으면 도착한 뒤에도 영영 "이동 중" 이라 목적지와 현재 위치를 비교한다.
  const [redirectHref, setRedirectHref] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current || !token) return;
    handledRef.current = true;

    const draft = peekOrderDraft();
    const clearToken = () => void setToken(null, { history: "replace" });

    if (!draft) {
      clearToken();
      return;
    }

    saveOrderDraft({ ...draft, cvs: { ...draft.cvs, storeToken: token } });

    const currentHref = source ? toOrderHref(source) : null;

    if (currentHref === draft.sourceHref) {
      clearToken();
      return;
    }

    setRedirectHref(draft.sourceHref);
    router.replace(draft.sourceHref);
  }, [token, source, setToken, router]);

  const currentHref = source ? toOrderHref(source) : null;
  const isRedirecting = redirectHref !== null && currentHref !== redirectHref;

  return { isRedirecting };
};
