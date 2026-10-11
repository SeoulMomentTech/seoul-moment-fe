---
name: mobile-simulator
description: apps/mobile 을 안드로이드 에뮬레이터에서 눈으로 확인한다. 화면을 딥링크로 열고, 탭·스크롤하고, 스크린샷을 찍어 읽는다. "에뮬레이터", "시뮬레이터", "화면 확인", "스크린샷", "실제로 어떻게 보이는지", "동작 확인" 같은 요청에 사용한다.
---

# Mobile Simulator Skill

`apps/mobile` 의 화면을 **실제로 보고 만져서** 확인한다. 타입체크·린트·번들은 레이아웃이
깨진 것도, 성공 경로가 한 번도 안 돈 것도 잡지 못한다 — 이 저장소에서 그런 결함이
여러 번 전부 통과한 적이 있다.

## 0. 절대 하지 않는 것

**개발 서버(Metro)를 띄우거나 끄거나 다시 시작하지 않는다.** 사용자가 직접 돌리고 있고,
건드리면 작업 흐름을 끊는다. 이미 떠 있는 것에 **붙기만** 한다. 안 떠 있으면 멈추고
사용자에게 띄워 달라고 말한다.

## 1. 안드로이드를 쓴다

iOS 가 아니라 안드로이드다. 이유는 하나뿐이다 — **adb 는 탭과 스크롤이 된다.**
iOS 쪽은 `simctl boot` 이 런타임만 켜고 Simulator.app 창은 열리지 않아서(이 환경에서
`open -a Simulator` 는 동작하지 않는다) 입력 도구가 붙을 창이 없다. 딥링크와 스크린샷만
되고 탭은 사람에게 부탁해야 한다. 안드로이드는 그 제약이 없다.

```bash
export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"
adb devices -l                                   # emulator-5554 가 device 로 보여야 한다
adb shell pm list packages | grep exponent       # host.exp.exponent (Expo Go)
```

에뮬레이터가 없으면 멈추고 사용자에게 띄워 달라고 말한다.

## 2. 접속 주소 — **127.0.0.1 이 아니다**

Expo Go 는 Metro 가 바인딩한 **LAN 주소**로만 붙는다.

```bash
curl -s -m 5 http://127.0.0.1:8081/status        # packager-status:running
IP=$(ipconfig getifaddr en0)                     # 예: 192.168.0.28
```

## 3. 화면 열기 — 딥링크

탭 없이 **어느 화면이든** 바로 연다. Expo Go 에서는 `/--/` 뒤에 앱 경로를 붙인다.
경로는 `apps/mobile/src/app/` 의 파일 구조 그대로이고 쿼리도 먹는다.

```bash
adb shell am start -a android.intent.action.VIEW -d "exp://$IP:8081/--/product/1"
adb shell am start -a android.intent.action.VIEW -d "exp://$IP:8081/--/cart"
adb shell am start -a android.intent.action.VIEW -d "exp://$IP:8081/--/order?cart=1,2"
adb shell am start -a android.intent.action.VIEW -d "exp://$IP:8081"      # 홈
```

**첫 번들은 60~90초** 걸린다. 그 뒤 같은 세션의 이동은 10초 안쪽이다.

## 4. 스크린샷 — 반드시 줄여서 읽는다

원본은 1080x2220 PNG 라 그대로 읽으면 컨텍스트를 크게 먹는다(3MB → 150KB).

```bash
adb exec-out screencap -p > "$S/shot.png"
sips -Z 800 "$S/shot.png" --out "$S/shot-small.png"
```

`shot-small.png` 를 Read 로 읽는다. 800px 면 뱃지 숫자까지 읽힌다.
`sips -c` 로 자르려 들지 말 것 — 가운데를 잘라서 원하는 부분이 안 나온다.

## 5. 탭·스크롤

좌표는 **실제 해상도 기준**이다. 줄인 스크린샷에서 잰 좌표에 `2220/줄인높이` 를 곱한다
(800 으로 줄였으면 2.775배).

```bash
adb shell wm size                                # Physical size: 1080x2220
adb shell input tap 540 1943                     # 가로 가운데 = 540
adb shell input swipe 540 1700 540 600 250       # 아래로 스크롤(위로 쓸기)
adb shell input swipe 540 700 540 1500 200       # 위로 스크롤
adb shell input keyevent 4                       # 뒤로가기
```

## 6. 확인할 것

이것들이 번들을 통과하고도 깨졌던 것들이다.

- 겹침: 고정 바가 본문 마지막 줄을 덮지 않는가
- 잘림: 배너·카드가 의도한 비율로 나오는가
- 자리 지킴: 로딩 자리와 실제 내용의 높이가 같은가
- 안전 영역: 아래 인디케이터에 버튼이 물리지 않는가
- 글자: 한 줄 가정한 자리가 두 줄로 넘치지 않는가
- **성공 경로**: 로그인이 필요한 동작(담기·주문)은 눌러서 끝까지 가 본다.
  에뮬레이터에 로그인 세션이 남아 있으면 그대로 쓸 수 있다.

## 7. 끝내고

에뮬레이터는 켜 둔다. 끄면 다음 확인이 다시 90초를 쓴다.
**개발 서버는 절대 건드리지 않는다.**
