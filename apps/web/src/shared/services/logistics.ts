import type { CommonRes } from "./";
import { api, API_PREFIX_URL } from "./";

/** 편의점 체인. UNIMART 7-ELEVEN / FAMI 全家 / HILIFE 萊爾富 */
export type CvsChain = "UNIMART" | "FAMI" | "HILIFE";

/** 편의점 픽업 매장. 주문 상세의 shipping.cvsStore 와 매장 조회 응답이 공유한다 */
export interface CvsStore {
  /** ECPay LogisticsSubType. 예: "UNIMARTC2C" */
  logisticsSubType: string;
  storeId: string;
  storeName: string;
  storeAddress: string;
  /** 7-ELEVEN 은 ECPay 가 주지 않아 null */
  storeTelephone: string | null;
  /** 離島(澎湖·金門·馬祖 등) 매장이면 true 라 외섬 배송비가 붙는다. Hi-Life 는 항상 false */
  isOutsideIsland: boolean;
}

export interface GetLogisticsCvsMapParams {
  chain: CvsChain;
  /**
   * 매장을 고른 뒤 돌아올 프론트 주소(주문서). 서버의 STOREFRONT_BASE_URL 로 시작해야
   * 하며(dev·local 은 `http://localhost:{포트}` 도 받는다), 아니면 서버가 무시하고 고른
   * 매장을 보여준다. 주문 대상 쿼리를 붙여 보내면 `&cvsStoreToken=` 으로 합쳐 돌아온다.
   */
  returnUrl?: string;
}

/**
 * @description 편의점 매장 선택 — ECPay 전자지도 열기.
 *
 * JSON API 가 아니라 브라우저를 같은 탭으로 보내는 URL 이다. 서버가 ECPay 전자지도로
 * auto-submit 하는 페이지를 주고, 매장을 고르면 `{returnUrl}?cvsStoreToken={token}` 으로
 * 돌아온다. 페이지를 떠나므로 주문서 입력값은 프론트가 보관해 둬야 한다.
 * ECPay 테스트 환경에서는 지도가 뜨지 않고 고정 매장을 돌려준다.
 */
export const getLogisticsCvsMapUrl = ({
  chain,
  returnUrl,
}: GetLogisticsCvsMapParams) => {
  const url = new URL("logistics/cvs/map", `${API_PREFIX_URL}/`);

  url.searchParams.set("chain", chain);
  if (returnUrl) url.searchParams.set("returnUrl", returnUrl);

  return url.toString();
};

export interface GetLogisticsCvsStoreRes extends CvsStore {
  /** 주문 생성(cvsPickup.storeToken)·미리보기(cvsStoreToken)에 그대로 넘긴다. 1시간 유효 */
  storeToken: string;
  chain: CvsChain;
}

/**
 * @description 고른 편의점 매장 조회.
 * 전자지도에서 돌아올 때 받은 cvsStoreToken 으로 매장 정보를 가져와 주문서에 보여준다.
 * 1시간이 지나면 404 라 다시 고르게 한다.
 */
export const getLogisticsCvsStore = (token: string) =>
  api
    .get(`logistics/cvs/store/${token}`)
    .json<CommonRes<GetLogisticsCvsStoreRes>>();
