// 주문서(`features/order`)도 같은 지역 데이터를 쓰므로 `shared/lib/regions.ts` 로 올렸다.
// feature 끼리 임포트하지 않기 위한 재수출 — 기존 import 경로는 그대로 둔다.
export {
  findZipCode,
  getCityOptions,
  getDistrictOptions,
  type RegionOption,
} from "@shared/lib/regions";
