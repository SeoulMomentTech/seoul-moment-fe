/**
 * 로그인한 사람의 기록 세 가지가 쓰는 쿼리 키.
 *
 * 세 키 모두 토큰에서 읽은 id 를 들고 있다 — 계정이 바뀌면 앞사람의 이름·이메일·치수가
 * 잠깐 보이지 않아야 한다. 키를 한 곳에 모아 두는 이유는 계정 화면의 쓰기가 끝난 뒤
 * 같은 키를 무효화해야 하기 때문이다. 화면마다 키를 손으로 적으면 한 글자만 달라도
 * 저장은 됐는데 화면은 옛 값을 들고 있는 상태가 된다.
 *
 * 세 요청 모두 languageCode 를 보내지 않는다(번역되는 값이 하나도 없다). 그래서 키에도 없다.
 */
export const userInfoKey = (id: number) => ["user", "info", id] as const;
export const userProfileKey = (id: number) => ["user", "profile", id] as const;
export const userFitKey = (id: number) => ["user", "fit", id] as const;
