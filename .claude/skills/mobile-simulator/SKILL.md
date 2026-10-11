---
name: mobile-simulator
description: apps/mobile 을 iOS 시뮬레이터에서 눈으로 확인한다. 화면을 딥링크로 열고 스크린샷을 찍어 읽는다. "시뮬레이터", "화면 확인", "스크린샷", "실제로 어떻게 보이는지", "레이아웃 확인" 같은 요청에 사용한다.
---

# Mobile Simulator Skill

`apps/mobile` 의 화면을 **실제로 보고** 확인한다. 타입체크·린트·번들은 레이아웃이
깨진 것을 잡지 못한다 — 이 저장소에서 그런 결함이 세 번 이상 전부 통과한 적이 있다.

## 0. 절대 하지 않는 것

**개발 서버(Metro)를 띄우거나 끄거나 다시 시작하지 않는다.** 사용자가 직접 돌리고 있고,
건드리면 작업 흐름을 끊는다. 서버는 **이미 떠 있는 것에 붙기만** 한다.

서버가 안 떠 있으면 멈추고 사용자에게 띄워 달라고 말한다. 대신 띄우지 않는다.

## 1. 서버 확인

```bash
curl -s -m 5 http://127.0.0.1:8081/status    # packager-status:running 이어야 한다
```

응답이 없으면 여기서 멈춘다.

## 2. 접속 주소 알아내기 — **127.0.0.1 이 아니다**

Expo Go 는 Metro 가 바인딩한 **LAN 주소**로만 연결된다. `exp://127.0.0.1:8081` 로 열면
`LSApplicationWorkspaceErrorDomain code=115` 로 실패한다.

```bash
ipconfig getifaddr en0        # 예: 192.168.0.28
```

## 3. 시뮬레이터 띄우기

```bash
xcrun simctl list devices available | grep iPhone     # 기기 고르기
xcrun simctl boot <UDID>                              # 이미 부팅돼 있으면 무시된다
xcrun simctl launch booted host.exp.Exponent          # Expo Go
```

`simctl boot` 은 런타임만 켠다. Simulator.app 창은 열리지 않으며, 이 환경에서
`open -a Simulator` 는 동작하지 않는다 — 그래서 **탭·스크롤은 할 수 없다**(4절).

## 4. 할 수 있는 것과 없는 것

| | 방법 |
| --- | --- |
| ✅ 아무 화면이나 열기 | 딥링크 (5절) |
| ✅ 보기 | 스크린샷 (6절) |
| ❌ 탭·스크롤·시트 열기 | Simulator.app 창이 없어 입력 도구가 붙지 못한다 |

**탭이 필요한 것은 사용자에게 부탁한다.** 예: Expo Go 첫 실행의 개발 메뉴("Continue"),
바텀 시트 열기, 스크롤 내린 상태 확인. 한 번 눌러 달라고 말하고 그 다음을 이어 간다.

## 5. 화면 열기 — 딥링크

탭 없이 **어느 화면이든** 바로 열 수 있다. Expo Go 에서는 `/--/` 뒤에 앱 경로를 붙인다.

```bash
IP=$(ipconfig getifaddr en0)
xcrun simctl openurl booted "exp://$IP:8081/--/product/1"
xcrun simctl openurl booted "exp://$IP:8081/--/cart"
xcrun simctl openurl booted "exp://$IP:8081/--/order?cart=1,2"
xcrun simctl openurl booted "exp://$IP:8081/--/promotion/7"
xcrun simctl openurl booted "exp://$IP:8081"            # 홈(탭)
```

경로는 `apps/mobile/src/app/` 의 파일 구조 그대로다. 쿼리 파라미터도 그대로 먹는다.

**첫 번들은 60~90초 걸린다.** 그 뒤 같은 세션의 이동은 10초 안쪽이다.

## 6. 스크린샷 찍고 읽기

원본은 3MB 넘는 Retina PNG 라 그대로 읽으면 컨텍스트를 크게 먹는다. **반드시 줄인다.**

```bash
S="<scratchpad 디렉터리>"
xcrun simctl io booted screenshot "$S/shot.png"
sips -Z 800 "$S/shot.png" --out "$S/shot-small.png"   # 800px 면 판독에 충분하다
```

그리고 `$S/shot-small.png` 를 Read 로 읽는다.

## 7. 확인할 것

화면을 받으면 다음을 본다 — 이것들이 번들을 통과하고도 깨졌던 것들이다.

- 겹침: 고정 바가 본문 마지막 줄을 덮지 않는가
- 잘림: 배너·카드가 의도한 비율로 나오는가
- 자리 지킴: 로딩 자리와 실제 내용의 높이가 같은가 (스켈레톤)
- 안전 영역: 아래 인디케이터에 버튼이 물리지 않는가
- 글자: 한 줄 가정한 자리가 두 줄로 넘치지 않는가

## 8. 끝내고

시뮬레이터는 켜 둔 채로 둔다. 끄면 다음 확인이 다시 90초를 쓴다.
**개발 서버는 절대 건드리지 않는다.**
