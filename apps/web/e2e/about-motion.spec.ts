import { test, expect, type Page } from "@playwright/test";

/**
 * about 페이지 모션의 회귀 방어.
 *
 * 가장 중요한 단정은 "모션이 예쁘게 재생되는가"가 아니라
 * **콘텐츠가 영구히 보이지 않는 상태로 갇히지 않는가**다.
 * 진입 모션의 초기 상태는 opacity 0이므로 트리거가 깨지면 본문이 사라진다.
 *
 * 반대로, 뷰포트를 한 번도 지나지 않은 요소가 아직 opacity 0인 것은 정상이다
 * (문서 끝으로 한 번에 점프하면 9개 전부 미재생 상태다 — 재진입하면 복구된다).
 * 그래서 단정 전에 항상 sweep으로 모든 요소를 실제로 뷰포트에 통과시킨다.
 */

const ABOUT = "/ko/about";

/**
 * 워드마크 이미지.
 * `exact` 없이는 푸터의 "Seoul Moment Threads" 등까지 부분 일치로 잡힌다.
 */
const wordmarkOf = (page: Page) =>
  page.getByAltText("seoul moment", { exact: true });

/**
 * 문서를 끝까지 내려간 뒤 다시 올라온다.
 *
 * 왕복하는 이유: 빠른 프로그래밍 스크롤에서는 IntersectionObserver 통지가
 * 밀려 fly-by를 놓칠 수 있다(특히 병렬 실행 부하 하의 Firefox).
 * 실제 사용자도 같은 일을 겪지만 다시 보일 때 재생되므로,
 * 테스트도 "한 번 지나갔다"가 아니라 "충분히 머물렀다"를 만들어야 한다.
 */
async function sweep(page: Page) {
  await page.evaluate(async () => {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const height = document.documentElement.scrollHeight;
    for (let y = 0; y <= height; y += 200) {
      window.scrollTo(0, y);
      await sleep(70);
    }
    for (let y = height; y >= 0; y -= 200) {
      window.scrollTo(0, y);
      await sleep(70);
    }
  });
}

/** 진입 모션이 걸린 요소 중 최종 상태에 도달하지 못한 것들. */
async function unsettled(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[style*="opacity"]')]
      .filter((el) => getComputedStyle(el).opacity !== "1")
      .map((el) => (el.textContent ?? "").trim().slice(0, 24)),
  );
}

/** 시간이 아니라 상태를 기다린다 — 고정 대기는 병렬 실행 부하에서 흔들린다. */
async function expectAllSettled(page: Page) {
  await expect.poll(() => unsettled(page), { timeout: 10_000 }).toEqual([]);
}

test.describe("about 페이지 모션", () => {
  test("스크롤 후 모든 섹션 콘텐츠가 보인다", async ({ page }) => {
    await page.goto(ABOUT);
    await sweep(page);

    // 섹션별 대표 문구 — 진입 모션이 콘텐츠를 숨긴 채 방치하지 않는지 확인
    await expect(page.getByText("Identity", { exact: true })).toBeVisible();
    await expect(page.getByText("Storyteller", { exact: true })).toBeVisible();
    await expect(page.getByText("Connector", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "VISION" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mission" })).toBeVisible();

    await expectAllSettled(page);
  });

  test("뷰포트를 건너뛴 요소도 재진입하면 복구된다", async ({ page }) => {
    await page.goto(ABOUT);

    // 한 프레임에 문서 끝으로 — 모든 진입 트리거를 건너뛴다
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );
    expect((await unsettled(page)).length).toBeGreaterThan(0);

    await sweep(page);
    await expectAllSettled(page);
  });

  test("히어로 워드마크가 클립된 채 남지 않는다", async ({ page }) => {
    await page.goto(ABOUT);

    const wordmark = wordmarkOf(page);
    await expect(wordmark).toBeVisible();

    // 와이프가 끝나면 clip-path는 inset(0) 또는 none이어야 한다.
    await expect
      .poll(
        () =>
          wordmark.evaluate((el) => {
            const clip = getComputedStyle(el).clipPath;
            return clip === "none" || /inset\(0px 0%? 0px 0px\)/.test(clip);
          }),
        { timeout: 4000 },
      )
      .toBe(true);
  });

  test("prefers-reduced-motion에서는 로드 연출이 선언되지 않는다", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(ABOUT);

    // CSS media query로 애니메이션 선언 자체가 사라진다 → 처음부터 최종 상태
    await expect(wordmarkOf(page)).toHaveCSS("animation-name", "none");
    await expect(wordmarkOf(page)).toHaveCSS("clip-path", "none");

    await sweep(page);
    await expectAllSettled(page);
  });

  /*
   * 섹션들이 min-w-7xl(1280px)이라 뷰포트가 좁으면 오른쪽 요소가 화면 밖에 놓인다.
   * IntersectionObserver는 두 축 모두 겹쳐야 발동하므로, Reveal이 가로 마진을
   * 열어두지 않으면 세로로 지나갔는데도 트리거되지 않아 콘텐츠가 갇힌다.
   */
  for (const [width, height] of [
    [1280, 800],
    [1024, 768],
    [768, 1024],
    [375, 812],
  ] as const) {
    test(`${width}px 폭에서도 진입 모션이 갇히지 않는다`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(ABOUT);
      await sweep(page);
      await expectAllSettled(page);
    });
  }

  test("문서가 수평으로 넘치지 않는다", async ({ page }) => {
    await page.goto(ABOUT);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
});
