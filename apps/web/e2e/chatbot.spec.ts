import { expect, test, type Page } from "@playwright/test";

/*
 * 챗봇 위젯 회귀 스펙.
 *
 * 이 위젯은 모든 라우트에 상시 마운트되는 첫 고정 요소라, 우하단을 클릭하는
 * 모든 테스트가 "element intercepts pointer events" 를 만날 수 있다. 그래서
 * 회귀 표면을 발견당하지 않고 여기서 소유한다.
 *
 * 우하단을 쓰는 테스트가 생기면 아래 킬 스위치를 쓰면 된다:
 *   await page.addInitScript(() => localStorage.setItem("e2e-disable-chatbot", "1"));
 */

/*
 * 이 앱의 페이지는 SSR + 다수의 히어로/썸네일 이미지라 Playwright 기본
 * navigationTimeout(30s)로는 부족하다. 브라우저 2개가 next start 한 대를
 * 병렬로 두드리면 두 번째 내비게이션이 있는 테스트부터 타임아웃이 난다
 * (실측: /ko/product goto, page.reload 에서 firefox·webkit 실패).
 * 페이지가 실제로 무거운 것이므로 대기 시간을 현실에 맞춘다.
 */
test.use({ navigationTimeout: 60_000 });
test.describe.configure({ timeout: 60_000 });

const launcher = (page: Page) => page.getByTestId("chat-launcher");
const panel = (page: Page) => page.getByTestId("chat-panel");
const thread = (page: Page) => page.getByRole("log");

/*
 * 기본 `load` 까지 기다린다. `domcontentloaded` 로 줄여봤지만 하이드레이션 전에
 * 단정이 시작돼 클릭이 유실되고 firefox·webkit 에서 더 불안정해졌다.
 * 테스트당 내비게이션을 1회로 줄인 것만으로 원래 문제(타임아웃)는 해소된다.
 */
const visit = (page: Page, path: string) => page.goto(path);

/*
 * 하이드레이션 전 클릭은 핸들러가 붙기 전이라 유실될 수 있다(증상: 패널이
 * 끝까지 나타나지 않음). 상태가 실제로 열릴 때까지 재시도한다.
 *
 * 클릭 전에 aria-expanded 를 확인하므로 멱등하다 — 이미 열린 뒤 재시도가
 * 돌아도 토글로 닫아버리지 않는다.
 */
const openChatbot = async (page: Page) => {
  await expect(launcher(page)).toBeVisible();

  await expect(async () => {
    if ((await launcher(page).getAttribute("aria-expanded")) !== "true") {
      await launcher(page).click();
    }
    await expect(launcher(page)).toHaveAttribute("aria-expanded", "true", {
      timeout: 1000,
    });
  }).toPass({ timeout: 15_000 });

  await expect(panel(page)).toBeVisible();
};

/*
 * sessionStorage 를 따로 비우지 않는다 — Playwright 는 테스트마다 새 컨텍스트를
 * 만들고 sessionStorage 는 컨텍스트 스코프라 이미 비어 있다.
 *
 * 처음에는 goto → clear → reload 로 짜뒀는데, 테스트당 전체 내비게이션이 2번씩
 * 돌면서 firefox·webkit 이 30s 타임아웃으로 무더기 실패했다(chromium 만 통과).
 * 불필요한 왕복이었다.
 */
test.beforeEach(async ({ page }) => {
  await visit(page, "/ko");
});

test.describe("챗봇 위젯", () => {
  test("모든 라우트에서 우하단 런처가 보인다", async ({ page }) => {
    await expect(launcher(page)).toBeVisible();

    const box = await launcher(page).boundingBox();
    const viewport = page.viewportSize();

    expect(box).not.toBeNull();
    expect(box!.x + box!.width).toBeGreaterThan(viewport!.width / 2);
    expect(box!.y).toBeGreaterThan(viewport!.height / 2);

    // 다른 라우트에서도 마운트된다. /ko/product 대신 가벼운 라우트를 쓴다 —
    // 검증하려는 건 "전역 마운트"이고, 상품 그리드의 이미지 로딩은 관계가 없다.
    await visit(page, "/ko/contact");
    await expect(launcher(page)).toBeVisible();
  });

  test("런처 접근명이 보이는 라벨과 일치한다 (WCAG 2.5.3)", async ({ page }) => {
    // aria-label 로 덮어쓰면 보이는 텍스트와 접근명이 어긋난다.
    await expect(launcher(page)).not.toHaveAttribute("aria-label", /.*/);
    await expect(launcher(page)).toHaveAccessibleName("무엇이든 물어보세요");
    await expect(launcher(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("도트 헤일로는 닫혀 있을 때만 돌고, 도트 밖에서 식별 가능하다", async ({
    page,
  }) => {
    const haloState = () =>
      page.evaluate(() => {
        const dot = document
          .querySelector('[data-testid="chat-launcher"]')!
          .querySelector("span[aria-hidden]")!;
        const style = getComputedStyle(dot, "::after");

        return {
          animationName: style.animationName,
          opacity: Number(style.opacity),
          scale: Number(style.transform.split("(")[1]?.split(",")[0] ?? 1),
        };
      });

    await expect(launcher(page)).toBeVisible();
    expect((await haloState()).animationName).toBe("chat-live-ping");

    /*
     * 한 주기를 훑어 "도트보다 커진 상태에서 식별 가능한 불투명도" 구간이
     * 실제로 존재하는지 확인한다. opacity 와 scale 곡선이 어긋나면 헤일로가
     * 진할 때는 도트에 가려지고 커졌을 때는 이미 사라져 아무것도 보이지 않는데,
     * 애니메이션이 "돌고 있다"는 단정만으로는 그 회귀를 잡지 못한다.
     */
    let visibleFrames = 0;
    for (let i = 0; i < 20; i++) {
      const { opacity, scale } = await haloState();
      if (scale >= 1.4 && opacity >= 0.3) visibleFrames += 1;
      await page.waitForTimeout(130);
    }
    expect(visibleFrames).toBeGreaterThan(0);

    // 열리면 멈춘다 — 대화 중 깜빡임은 상태를 전달하지 않는 순수한 소음이다.
    await openChatbot(page);
    expect((await haloState()).animationName).toBe("none");
  });

  test("reduced-motion 에서는 헤일로가 선언되지 않는다", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(launcher(page)).toBeVisible();

    const halo = await page.evaluate(() => {
      const dot = document
        .querySelector('[data-testid="chat-launcher"]')!
        .querySelector("span[aria-hidden]")!;
      const style = getComputedStyle(dot, "::after");

      return { animationName: style.animationName, opacity: style.opacity };
    });

    expect(halo.animationName).toBe("none");
    // 기본 opacity 가 0 이어야 한다 — 아니면 불투명한 오렌지 원이 도트를 덮는다.
    expect(halo.opacity).toBe("0");
  });

  test("첫 화면이 의도 선택 칩을 가르친다", async ({ page }) => {
    await openChatbot(page);

    await expect(thread(page)).toHaveAttribute("aria-label", "대화 내용");
    // 복합 어시스턴트라 진입점을 명시적으로 준다.
    await expect(
      panel(page).getByRole("button", { name: "상품 추천 받기" }),
    ).toBeVisible();
    await expect(
      panel(page).getByRole("button", { name: "주문·배송 조회" }),
    ).toBeVisible();
  });

  test("칩을 누르면 상품 카드가 실린 답변이 온다", async ({ page }) => {
    await openChatbot(page);
    await panel(page).getByRole("button", { name: "상품 추천 받기" }).click();

    // 사용자 턴이 먼저 낙관적으로 붙는다.
    await expect(
      thread(page).getByText("상품 추천 받기", { exact: true }).first(),
    ).toBeVisible();

    await expect(
      thread(page).getByText("취향에 맞을 것 같은 상품을 골라봤어요."),
    ).toBeVisible();
    await expect(
      thread(page).getByRole("link", { name: /Oversized Wool Coat/ }),
    ).toBeVisible();

    // 첫 화면 칩은 소비되면 사라진다(빈 상태가 메시지 목록으로 교체된다).
    await expect(
      thread(page).getByRole("button", { name: "상품 추천 받기" }),
    ).toHaveCount(0);
    // 최신 턴의 칩만 살아 있다.
    await expect(
      thread(page).getByRole("button", { name: "다른 상품 더 보기" }),
    ).toBeEnabled();
  });

  test("이전 턴의 칩은 비활성이 되어 낡은 의도를 쏘지 않는다", async ({
    page,
  }) => {
    await openChatbot(page);
    await panel(page).getByRole("button", { name: "상품 추천 받기" }).click();
    await expect(
      thread(page).getByRole("button", { name: "다른 상품 더 보기" }),
    ).toBeEnabled();

    // 두 번째 턴 — 첫 턴의 칩이 과거가 된다.
    await panel(page).getByRole("button", { name: "배송비가 궁금해요" }).click();
    await expect(
      thread(page).getByText("대만 내 배송은", { exact: false }),
    ).toBeVisible();

    await expect(
      thread(page).getByRole("button", { name: "다른 상품 더 보기" }),
    ).toBeDisabled();
    await expect(
      thread(page).getByRole("button", { name: "주문 상태 확인" }),
    ).toBeEnabled();
  });

  test("자유 입력을 전송하면 폴백 답변이 온다", async ({ page }) => {
    await openChatbot(page);

    const composer = panel(page).getByRole("textbox", { name: "메시지 입력" });
    await composer.fill("안녕하세요");
    await composer.press("Enter");

    await expect(thread(page).getByText("안녕하세요").first()).toBeVisible();
    await expect(
      thread(page).getByText("아직 정확히 이해하지 못했어요.", {
        exact: false,
      }),
    ).toBeVisible();
    // 전송 후 컴포저는 비워진다.
    await expect(composer).toHaveValue("");
  });

  test("빈 입력은 전송 버튼이 비활성이다", async ({ page }) => {
    await openChatbot(page);

    const send = panel(page).getByRole("button", { name: "보내기" });
    await expect(send).toBeDisabled();

    await panel(page)
      .getByRole("textbox", { name: "메시지 입력" })
      .fill("코트 추천");
    await expect(send).toBeEnabled();
  });

  test("Shift+Enter 는 전송하지 않고 줄바꿈한다", async ({ page }) => {
    await openChatbot(page);

    const composer = panel(page).getByRole("textbox", { name: "메시지 입력" });
    await composer.fill("첫 줄");
    await composer.press("Shift+Enter");
    await composer.pressSequentially("둘째 줄");

    await expect(composer).toHaveValue("첫 줄\n둘째 줄");
    await expect(thread(page).getByRole("listitem")).toHaveCount(0);
  });

  test("비모달: 외부 클릭으로 닫히지 않고 페이지는 계속 스크롤된다", async ({
    page,
  }) => {
    await openChatbot(page);

    await page.getByRole("heading", { name: "Seoul Moment" }).first().click();
    await expect(panel(page)).toBeVisible();

    await page.mouse.wheel(0, 400);
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(0);
    await expect(launcher(page)).toHaveAttribute("aria-expanded", "true");
  });

  test("Esc 로 닫히고 포커스가 런처로 돌아온다", async ({ page }) => {
    await openChatbot(page);

    await panel(page).getByRole("textbox", { name: "메시지 입력" }).press("Escape");

    await expect(launcher(page)).toHaveAttribute("aria-expanded", "false");
    await expect(launcher(page)).toBeFocused();
  });

  test("닫힌 패널은 inert 라서 탭 순서에 남지 않는다", async ({ page }) => {
    await openChatbot(page);
    await panel(page).getByRole("button", { name: "닫기" }).click();

    await expect(launcher(page)).toHaveAttribute("aria-expanded", "false");
    // 마운트 래치 때문에 DOM 에는 남지만 상호작용 대상이 아니어야 한다.
    await expect(panel(page)).toHaveAttribute("inert", "");
    await expect(panel(page)).toHaveAttribute("aria-hidden", "true");
  });

  test("스레드가 라우트 이동과 리로드를 모두 넘긴다", async ({ page }) => {
    await openChatbot(page);
    await panel(page)
      .getByRole("textbox", { name: "메시지 입력" })
      .fill("기억해 주세요");
    await panel(page).getByRole("button", { name: "보내기" }).click();
    await expect(thread(page).getByText("기억해 주세요")).toBeVisible();

    // 클라이언트 사이드 라우트 이동 — 전역 위젯이므로 패널은 **열린 채** 유지되고
    // ([locale] 레이아웃이 같은 로케일 내 이동에서 리마운트되지 않는다)
    // 스레드도 그대로다. 여기서 런처를 다시 누르면 토글로 닫히므로 누르지 않는다.
    await page.getByRole("link", { name: "Product" }).first().click();
    await page.waitForURL(/\/product/);
    await expect(launcher(page)).toHaveAttribute("aria-expanded", "true");
    await expect(thread(page).getByText("기억해 주세요")).toBeVisible();

    // 하드 리로드 — isOpen 은 저장하지 않으므로 닫힌 상태로 시작하고,
    // 스레드만 sessionStorage 에서 복원된다.
    await page.reload();
    await expect(launcher(page)).toHaveAttribute("aria-expanded", "false");
    await openChatbot(page);
    await expect(thread(page).getByText("기억해 주세요")).toBeVisible();
  });

  test("대화 새로 시작이 스레드를 비운다", async ({ page }) => {
    await openChatbot(page);
    await panel(page).getByRole("button", { name: "상품 추천 받기" }).click();
    await expect(thread(page).getByRole("listitem").first()).toBeVisible();

    await panel(page).getByRole("button", { name: "대화 새로 시작" }).click();

    await expect(thread(page).getByRole("listitem")).toHaveCount(0);
    await expect(
      panel(page).getByRole("button", { name: "상품 추천 받기" }),
    ).toBeEnabled();
  });

  test("킬 스위치로 위젯을 끌 수 있다", async ({ page }) => {
    await page.addInitScript(() =>
      localStorage.setItem("e2e-disable-chatbot", "1"),
    );

    /*
     * beforeEach 가 이미 /ko 를 열어둔 상태라, 같은 URL 로 다시 navigate 하면
     * 문서가 새로 생성되지 않을 수 있고(firefox 에서 실측) 그러면 addInitScript
     * 가 적용된 문서에서 마운트되지 않아 런처가 그대로 남는다.
     * 다른 라우트로 이동해 확실히 새 문서를 받는다.
     */
    await visit(page, "/ko/contact");

    await expect(launcher(page)).toHaveCount(0);
    // 컨텍스트가 테스트 단위로 폐기되므로 정리할 필요가 없다.
  });
});
