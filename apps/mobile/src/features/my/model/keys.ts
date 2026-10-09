/**
 * 관심 목록 세 갈래가 함께 쓰는 쿼리 키 머리와 페이지 크기.
 *
 * 머리를 한 곳에 두는 이유는 해제(좋아요 취소)가 목록을 건드려야 하기 때문이다.
 * 카테고리를 바꿔 가며 보면 필터마다 다른 캐시가 쌓이는데, 머리만으로 부분 일치시켜야
 * 그 전부를 한 번에 고칠 수 있다.
 */
export const USER_PRODUCT_LIKE_KEY = ["user", "like", "product"] as const;
export const USER_BRAND_LIKE_KEY = ["user", "like", "brand"] as const;
export const USER_RECENT_KEY = ["user", "recent"] as const;

/**
 * 목록은 한 페이지만 받는다. 마이 탭 전체가 ScrollView 라 그 안에 FlatList 를 넣어
 * 무한 스크롤을 달 수 없고(스크롤 축이 겹쳐 가상화가 깨진다), 관심 목록이 50줄을
 * 넘는 경우는 실사용에서 사실상 없다. 넘는 날이 오면 탭을 제 화면으로 떼어 내야 한다.
 */
export const LIKES_PAGE = 1;
export const LIKES_PAGE_SIZE = 50;
