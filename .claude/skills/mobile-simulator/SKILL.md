---
name: mobile-simulator
description: apps/mobile 을 에뮬레이터/시뮬레이터에서 눈으로 확인한다. 화면을 딥링크로 열고 스크린샷을 찍어 읽으며, 안드로이드에서는 탭·스크롤까지 한다. 플랫폼은 인자로 고른다(android | ios, 기본 android). "에뮬레이터", "시뮬레이터", "화면 확인", "스크린샷", "실제로 어떻게 보이는지", "동작 확인" 같은 요청에 사용한다.
---

# Mobile Simulator Skill

`apps/mobile` 의 화면을 **실제로 보고** 확인한다. 타입체크·린트·번들은 레이아웃이 깨진
것도, 성공 경로가 한 번도 안 돈 것도 잡지 못한다 — 이 저장소에서 그런 결함이 여러 번
전부 통과한 적이 있다.

## 0. 절대 하지 않는 것

**개발 서버(Metro)를 띄우거나 끄거나 다시 시작하지 않는다.** 사용자가 직접 돌리고 있고,
건드리면 작업 흐름을 끊는다. 이미 떠 있는 것에 **붙기만** 한다. 안 떠 있으면 멈추고
사용자에게 띄워 달라고 말한다.

## 1. 어느 앱에 붙나 — dev build 가 먼저다

LINE 로그인이 네이티브 모듈이라 **Expo Go 로는 그 화면을 끝까지 볼 수 없다**.
dev build 가 깔려 있으면 그쪽에 붙는다.

```bash
adb shell pm list packages | grep seoulmoment      # tw.com.seoulmoment.app
```

| | dev build | Expo Go |
| --- | --- | --- |
| 띄우기 | `adb shell am start -a android.intent.action.VIEW -d "seoulmoment://expo-development-client/?url=http%3A%2F%2F$IP%3A8081"` | `exp://$IP:8081` |
| 화면 열기 | `seoulmoment://<경로>` | `exp://$IP:8081/--/<경로>` |
| LINE 로그인 | ✅ | ❌ "not available in this build" |

dev build 쪽 딥링크가 짧다 — `seoulmoment://login`, `seoulmoment://product/1`.
**홈 탭(`/`)은 양쪽 다 딥링크로 못 간다**(경로가 비어 있다). 다른 탭으로 간 뒤 탭 바를
누르거나, dev build 를 그냥 띄우면 홈에서 시작한다.

없으면 만든다 — `npx expo run:android` (처음은 9분쯤, 그 뒤로는 훨씬 빠르다).

## 2. 플랫폼 고르기

인자로 받는다 — `android` 또는 `ios`. **인자가 없으면 android.**

| | android | ios |
| --- | --- | --- |
| 화면 열기·보기 | ✅ | ✅ |
| **탭·스크롤·뒤로가기** | ✅ | ❌ 사람이 해야 한다 |

iOS 에서 입력이 안 되는 이유: `simctl boot` 은 런타임만 켜고 Simulator.app 창을 열지
않는다. 이 환경에서 `open -a Simulator` 는 동작하지 않아(조용히 실패한다) 입력 도구가
붙을 창이 없다. 창이 없어도 **스크린샷은 찍힌다** — 못 하는 것은 입력뿐이다.

그래서 기본은 android 다. **사용자가 ios 를 고르면 그대로 따르되**, 탭이 필요한
지점에서 "여기는 눌러 주셔야 한다"고 말하고 그다음을 이어 간다.

사용자가 ios 를 골랐는데 Simulator.app 창이 안 떠 있으면, 사용자에게
`! open -a Simulator` 를 실행해 달라고 부탁한다(직접 열려고 반복 시도하지 않는다).

## 3. 서버와 주소 — 두 플랫폼 공통

Expo Go 는 Metro 가 바인딩한 **LAN 주소**로만 붙는다. `127.0.0.1` 로 열면 실패한다
(iOS 는 `LSApplicationWorkspaceErrorDomain code=115`).

```bash
curl -s -m 5 http://127.0.0.1:8081/status    # packager-status:running 이어야 한다
IP=$(ipconfig getifaddr en0)                 # 예: 192.168.0.28
```

## 4. 명령 대조표

```bash
export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools:$HOME/Library/Android/sdk/emulator"
```

| 할 일 | android | ios |
| --- | --- | --- |
| 기기 확인 | `adb devices -l` | `xcrun simctl list devices booted` |
| 기기 띄우기 | `emulator -avd $(emulator -list-avds \| head -1) &` | `xcrun simctl boot <UDID>` |
| Expo Go 확인 | `adb shell pm list packages \| grep exponent` | `xcrun simctl listapps booted \| grep Exponent` |
| Expo Go 실행 | (딥링크가 띄운다) | `xcrun simctl launch booted host.exp.Exponent` |
| 화면 열기 | `adb shell am start -a android.intent.action.VIEW -d "<url>"` | `xcrun simctl openurl booted "<url>"` |
| 스크린샷 | `adb exec-out screencap -p > f.png` | `xcrun simctl io booted screenshot f.png` |
| 해상도 | `adb shell wm size` | 스크린샷 크기로 본다 |
| 탭 | `adb shell input tap X Y` | — |
| 스크롤 | `adb shell input swipe X Y1 X Y2 250` | — |
| 뒤로가기 | `adb shell input keyevent 4` | — |

## 5. 화면 열기 — 딥링크

탭 없이 **어느 화면이든** 바로 연다. Expo Go 에서는 `/--/` 뒤에 앱 경로를 붙인다.
경로는 `apps/mobile/src/app/` 의 파일 구조 그대로이고 쿼리도 먹는다.

```
exp://$IP:8081/--/product/1
exp://$IP:8081/--/cart
exp://$IP:8081/--/order?cart=1,2
exp://$IP:8081/--/shop              # 탭도 경로가 있다 (shop · news · my)
```

**홈 탭(`/`)은 딥링크로 못 간다** — 경로가 비어서 `exp://$IP:8081` 도 `/--/` 도 이미 열린
화면을 그대로 둔다. 다른 탭으로 간 뒤 탭 바의 Home 을 누르거나(좌표는 §6), 뒤로가기를
반복해 스택을 비운다.

**첫 번들은 60~90초** 걸린다. 그 뒤 같은 세션의 이동은 10초 안쪽이다.

## 6. 스크린샷 — 반드시 줄여서 읽는다

원본은 3MB 넘는 PNG 라 그대로 읽으면 컨텍스트를 크게 먹는다(줄이면 150KB).

```bash
sips -Z 800 "$S/shot.png" --out "$S/shot-small.png"
```

`shot-small.png` 를 Read 로 읽는다. 800px 면 뱃지 숫자까지 읽힌다.
`sips -c` 로 자르려 들지 말 것 — 위가 아니라 **가운데**를 잘라서 원하는 데가 안 나온다.

## 7. 좌표 (android)

좌표는 **기기 픽셀 기준**이다. 줄인 스크린샷에서 잰 값에 `실제높이/줄인높이` 를 곱한다
(1080x2220 을 800 으로 줄였으면 2.775배). 가로 가운데는 540.
§5 의 좌표 예: 로그인 화면의 "Continue with LINE" 은 540 1379 다.

## 8. 확인할 것

이것들이 번들을 통과하고도 깨졌던 것들이다.

- 겹침: 고정 바가 본문 마지막 줄을 덮지 않는가
- 잘림: 배너·카드가 의도한 비율로 나오는가
- 자리 지킴: 로딩 자리와 실제 내용의 높이가 같은가
- 안전 영역: 아래 인디케이터에 버튼이 물리지 않는가
- 글자: 한 줄 가정한 자리가 두 줄로 넘치지 않는가
- **성공 경로**: 로그인이 필요한 동작(담기·주문)은 눌러서 끝까지 가 본다.
  기기에 로그인 세션이 남아 있으면 그대로 쓸 수 있다. (android 전용)

## 9. 끝내고

기기는 켜 둔다. 끄면 다음 확인이 다시 90초를 쓴다.
내가 띄운 기기만 내린다 — 사용자가 이미 띄워 둔 것은 그대로 둔다.
**개발 서버는 절대 건드리지 않는다.**
