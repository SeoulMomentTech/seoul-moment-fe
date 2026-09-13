// 주문서(`features/order`)도 기본 배송지로 같은 프로필을 읽는다. 쿼리 키가 갈라지면
// 같은 응답을 두 번 받게 되므로 `entities/user` 로 올리고 여기서는 재수출만 한다.
export { useGetUserProfileQuery } from "@entities/user";
