# Terms of Service 컴포넌트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 번체 중국어 플랫폼 서비스 약관(TOS) 본문을 단일 재사용 컴포넌트로 정의하고, 전용 페이지(`/terms`)·약관 동의 모달·로그인 약관 링크·Footer 링크에서 공통으로 노출한다.

**Architecture:** `shared/ui`에 정적 프레젠테이션 컴포넌트 `TermsOfServiceContent`(zh-TW 본문 JSX 하드코딩)를 만들고, 이를 전용 페이지 뷰와 기존 `TermsModal`(회원가입 동의 UI) 양쪽에서 재사용한다. ko/en 로케일도 현 단계에선 동일 zh-TW 본문을 노출(폴백)한다. Footer에는 기존 `/policy` 링크를 유지한 채 `/terms` 링크를 추가한다.

**Tech Stack:** Next.js 15 (App Router), FSD, `@seoul-moment/ui`(VStack/cn), next-intl v4, `@/i18n/navigation`(Link), Vitest + Testing Library.

---

## 파일 구조

| 파일 | 책임 | 신규/수정 |
| --- | --- | --- |
| `apps/web/src/shared/ui/terms-of-service-content.tsx` | TOS 본문 프레젠테이션 컴포넌트(헬퍼 Section/SubSection/Paragraph/Bullets 포함) | 신규 |
| `apps/web/src/shared/ui/terms-of-service-content.test.tsx` | 본문 스모크 렌더 테스트 | 신규 |
| `apps/web/src/views/terms/ui/TermsPage.tsx` | `/terms` 페이지 레이아웃(제목 + 컨테이너) | 신규 |
| `apps/web/src/views/terms/index.tsx` | 뷰 배럴 export | 신규 |
| `apps/web/src/app/[locale]/terms/page.tsx` | `/terms` 라우트 엔트리 | 신규 |
| `apps/web/src/shared/ui/terms-consent.tsx` | `termsOfService` 모달 본문에 `TermsOfServiceContent` 연결 | 수정 |
| `apps/web/src/features/login/ui/LoginTerms.tsx` | `會員條款` 링크를 `/terms`로 연결 | 수정 |
| `apps/web/src/widgets/footer/ui/Footer.tsx` | `/terms` 링크 추가 | 수정 |
| `apps/web/src/i18n/messages/{zh-TW,ko,en}.json` | `terms` 라벨 키 추가 | 수정 |

> 참고: 본 계획의 코드 단계에서 import를 추가/수정한 뒤에는 husky/lint-staged가 커밋 시 import 순서를 재정렬할 수 있으므로, 커밋 직전 `pnpm lint:fix:web` 실행을 각 커밋 단계에 포함한다.

---

## Task 1: TermsOfServiceContent 컴포넌트

**Files:**
- Create: `apps/web/src/shared/ui/terms-of-service-content.tsx`
- Test: `apps/web/src/shared/ui/terms-of-service-content.test.tsx`

- [ ] **Step 1: Write the failing test**

`apps/web/src/shared/ui/terms-of-service-content.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";

import { TermsOfServiceContent } from "./terms-of-service-content";

describe("TermsOfServiceContent", () => {
  it("renders the major section titles", () => {
    // given / when
    render(<TermsOfServiceContent />);

    // then
    expect(
      screen.getByRole("heading", { name: "服務說明" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "交易條款" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "免責聲明" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "公司資訊" }),
    ).toBeInTheDocument();
  });

  it("renders the last updated date", () => {
    // given / when
    render(<TermsOfServiceContent />);

    // then
    expect(screen.getByText(/2024年11月26日/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && pnpm vitest run src/shared/ui/terms-of-service-content.test.tsx`
Expected: FAIL — `Failed to resolve import "./terms-of-service-content"` (파일 미존재).

- [ ] **Step 3: Write the component**

`apps/web/src/shared/ui/terms-of-service-content.tsx`:

```tsx
import type { PropsWithChildren, ReactNode } from "react";

import { cn, VStack } from "@seoul-moment/ui";

function Section({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <VStack className="w-full" gap={12}>
      <h2 className="text-body-1 text-foreground w-full font-semibold leading-snug">
        {title}
      </h2>
      <VStack className="w-full" gap={16}>
        {children}
      </VStack>
    </VStack>
  );
}

function SubSection({
  title,
  children,
}: PropsWithChildren<{ title?: string }>) {
  return (
    <VStack className="w-full" gap={6}>
      {title ? (
        <h3 className="text-body-2 text-foreground w-full font-medium leading-snug">
          {title}
        </h3>
      ) : null}
      {children}
    </VStack>
  );
}

function Paragraph({ children }: PropsWithChildren) {
  return (
    <p className="text-body-3 w-full leading-relaxed text-black/60">
      {children}
    </p>
  );
}

function Bullets({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "text-body-3 w-full list-disc space-y-1 pl-5 leading-relaxed text-black/60",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function TermsOfServiceContent(): ReactNode {
  return (
    <VStack className="w-full" gap={32}>
      <VStack className="w-full" gap={4}>
        <h1 className="text-title-4 text-foreground w-full font-semibold leading-snug">
          首爾映像有限公司 平台服務條款
        </h1>
      </VStack>

      <Section title="服務說明">
        <SubSection title="服務範圍">
          <Paragraph>本平台主要提供以下服務：</Paragraph>
        </SubSection>
        <SubSection title="商品資訊展示與導購服務">
          <Bullets
            items={[
              "重要聲明：本平台僅提供商品資訊展示及導購服務，本身不具備結帳交易功能",
              "當您點擊商品頁面之「立即購買」、「前往購買」或類似按鈕後，將被導向本公司於第三方電商平台（包括但不限於蝦皮購物、酷澎等）所開設之賣場",
              "所有交易行為（包括下單、付款、配送等）均於該第三方電商平台完成",
              "本平台提供韓國商品資訊查詢、比較及推薦服務",
              "24小時線上客服諮詢（商品資訊及導購服務）",
            ]}
          />
        </SubSection>
        <SubSection title="會員服務">
          <Bullets
            items={[
              "會員註冊與管理",
              "商品收藏與追蹤功能",
              "個人化商品推薦",
              "優惠活動通知",
            ]}
          />
        </SubSection>
        <SubSection title="資訊服務">
          <Bullets
            items={[
              "韓國流行趨勢資訊",
              "商品評價與心得分享",
              "購物指南與常見問題",
            ]}
          />
        </SubSection>
        <SubSection title="服務性質重要說明">
          <Bullets
            items={[
              "本平台為商品資訊展示及導購平台",
              "本平台不處理任何交易行為",
              "本平台不收取任何款項",
              "本平台不負責商品配送",
              "本平台不開立發票或收據",
            ]}
          />
        </SubSection>
        <SubSection title="實際交易平台">
          <Paragraph>所有商品交易均於第三方電商平台完成，目前包括：</Paragraph>
          <Bullets
            items={[
              "蝦皮購物（Shopee）",
              "酷澎（Coupon）",
              "其他本公司合作之電商平台",
            ]}
          />
          <Paragraph>
            該等第三方電商平台之服務條款、交易規則、付款方式、配送政策、退換貨規定等，均依各該平台之規定辦理
          </Paragraph>
        </SubSection>
        <SubSection title="本公司角色說明">
          <Bullets
            items={[
              "本公司為商品資訊提供者及導購服務提供者",
              "本公司同時為前述第三方電商平台之賣家（商店經營者）",
              "當您透過本平台導向第三方電商平台並完成交易後，您與本公司之買賣契約關係成立於該第三方電商平台",
            ]}
          />
        </SubSection>
        <SubSection title="服務調整權利">
          <Paragraph>
            本公司得依實際營運需求，增加、修改或終止上述服務項目，並將以適當方式通知會員。
          </Paragraph>
        </SubSection>
      </Section>

      <Section title="交易條款">
        <SubSection title="導購流程說明">
          <Bullets
            items={[
              "您在本平台瀏覽商品資訊後，點擊「立即購買」、「前往購買」或類似按鈕",
              "系統將自動導向本公司於第三方電商平台（蝦皮購物、酷澎等）之賣場",
              "您須於該第三方電商平台完成所有交易程序，包括：確認商品內容與數量、選擇付款方式、填寫或確認配送資訊、完成付款",
              "買賣契約於您在第三方電商平台完成訂購並經該平台確認後成立",
            ]}
          />
        </SubSection>
        <SubSection title="重要提醒">
          <Bullets
            items={[
              "本平台僅為導購服務，不涉入交易過程",
              "本平台展示之商品資訊（包括價格、庫存、規格等）僅供參考，實際交易內容以第三方電商平台顯示為準",
              "不同電商平台之商品價格、促銷活動可能有所差異",
              "您於第三方電商平台之會員資格、購物記錄與本平台之會員資格為各自獨立系統",
            ]}
          />
        </SubSection>
        <SubSection title="第三方電商平台交易規範">
          <Paragraph>
            當您透過本平台導向第三方電商平台進行交易時，您應遵守並受下列規範約束：
          </Paragraph>
          <Bullets
            items={[
              "該第三方電商平台之服務條款或使用者條款",
              "該第三方電商平台之交易規則",
              "該第三方電商平台之隱私權政策",
              "本公司於該第三方電商平台賣場之賣場規則或商品說明",
            ]}
          />
        </SubSection>
        <SubSection title="付款方式">
          <Bullets
            items={[
              "付款方式依各第三方電商平台提供之選項為準",
              "常見付款方式包括：信用卡、ATM轉帳、超商代碼、電子支付等",
              "付款安全由各該第三方電商平台負責",
            ]}
          />
        </SubSection>
        <SubSection title="配送服務">
          <Bullets
            items={[
              "配送方式、時間及費用依各第三方電商平台及本公司賣場規定",
              "配送進度可於各該第三方電商平台之訂單管理系統查詢",
              "配送相關問題請聯繫該第三方電商平台客服或本公司客服",
            ]}
          />
        </SubSection>
        <SubSection title="消費者權益保障">
          <Bullets
            items={[
              "依消費者保護法第19條規定，除通訊交易解除權合理例外情形適用準則規範之商品外，您享有收受商品後七日內解除契約之權利",
              "退貨申請及處理程序依各第三方電商平台之退貨政策辦理",
              "您可透過該第三方電商平台之退貨系統申請，或聯繫本公司客服協助處理",
            ]}
          />
        </SubSection>
        <SubSection title="退貨流程">
          <Bullets
            items={[
              "請先於第三方電商平台（如蝦皮購物、酷澎）之訂單管理系統申請退貨",
              "或直接聯繫本公司客服，本公司將協助您完成退貨程序",
              "退貨商品須保持完整（含商品、贈品、附件、包裝及相關文件）",
              "退款方式依各該第三方電商平台之規定辦理",
            ]}
          />
        </SubSection>
        <SubSection title="商品瑕疵或錯誤">
          <Bullets
            items={[
              "若商品有瑕疵或與訂購內容不符，請立即聯繫本公司客服",
              "本公司將依消費者保護法及相關法令規定處理",
              "瑕疵商品之退換貨不受七日期限限制",
            ]}
          />
        </SubSection>
        <SubSection title="本平台與第三方電商平台之關係">
          <Bullets
            items={[
              "本公司於蝦皮購物、酷澎等平台開設官方賣場",
              "您透過本平台導向後於該等平台下單，即與本公司成立買賣契約",
              "契約履行（付款、配送、退換貨等）依各該平台規則辦理",
              "本平台展示之商品資訊力求與第三方電商平台一致，但仍可能因資訊更新時間差而有差異",
              "如有資訊不一致，以第三方電商平台實際顯示內容為準",
            ]}
          />
        </SubSection>
        <SubSection title="客戶服務">
          <Bullets
            items={[
              "關於商品資訊、導購服務問題：請聯繫本公司客服",
              "關於訂單、付款、配送、退換貨問題：可聯繫本公司客服或各該第三方電商平台客服",
              "本公司客服將盡力協助您解決於第三方電商平台交易時遇到的問題",
            ]}
          />
        </SubSection>
      </Section>

      <Section title="付款說明">
        <SubSection title="付款處理">
          <Bullets
            items={[
              "本平台不處理任何付款事宜",
              "本平台不具備金流處理功能",
              "所有付款均於第三方電商平台完成",
              "付款安全由各該第三方電商平台負責",
            ]}
          />
        </SubSection>
        <SubSection title="付款方式">
          <Paragraph>
            依您選擇之第三方電商平台提供之付款方式，常見包括：
          </Paragraph>
          <Bullets
            items={[
              "信用卡付款（含分期）",
              "ATM轉帳",
              "超商代碼繳費",
              "電子支付（如街口支付、LINE Pay等）",
              "貨到付款（依平台及商品而定）",
            ]}
          />
        </SubSection>
        <SubSection title="發票開立">
          <Bullets
            items={[
              "發票由您完成交易之第三方電商平台或本公司依該平台規定開立",
              "電子發票將依各該平台規則寄送或存入您的載具",
            ]}
          />
        </SubSection>
      </Section>

      <Section title="退貨與退款">
        <SubSection title="退貨管道">
          <Paragraph>您可透過以下方式申請退貨：</Paragraph>
          <Bullets
            items={[
              "直接於第三方電商平台申請（登入蝦皮購物、酷澎或其他平台帳號，於訂單管理系統中申請退貨，依該平台流程完成）",
              "聯繫本公司客服協助（客服電話、客服信箱、線上客服系統）",
              "本公司將協助您於各該第三方電商平台完成退貨程序",
            ]}
          />
        </SubSection>
        <SubSection title="退款處理">
          <Bullets
            items={[
              "退款由第三方電商平台依其規定辦理",
              "退款方式及時間依各該平台規定",
              "如有退款問題，可聯繫該平台客服或本公司客服",
            ]}
          />
        </SubSection>
        <SubSection title="退貨條件及限制">
          <Paragraph>
            依各第三方電商平台規定及消費者保護法相關規定辦理。一般原則：
          </Paragraph>
          <Bullets
            items={[
              "商品須保持完整（含配件、贈品、包裝等）",
              "特殊商品（如貼身衣物、食品等）依法令規定可能不適用猶豫期",
              "瑕疵商品退換不受期限限制",
            ]}
          />
        </SubSection>
      </Section>

      <Section title="個人資料保護與隱私權">
        <SubSection title="本平台個人資料蒐集範圍">
          <Paragraph>
            本平台僅蒐集會員註冊及使用導購服務所需之基本資料：
          </Paragraph>
          <Bullets
            items={[
              "姓名、電子郵件、手機號碼",
              "會員偏好設定、瀏覽記錄",
              "網站使用行為資料（含Cookie）",
            ]}
          />
        </SubSection>
        <SubSection title="不蒐集交易資料">
          <Bullets
            items={[
              "本平台不蒐集任何付款資訊（如信用卡號、銀行帳戶等）",
              "本平台不蒐集完整訂單交易資料",
              "前述交易資料由各第三方電商平台依其隱私權政策處理",
              "詳細規範，請參閱首爾映象隱私權政策",
            ]}
          />
        </SubSection>
        <SubSection title="第三方電商平台個人資料">
          <Bullets
            items={[
              "當您點擊導向至第三方電商平台後，該平台將依其隱私權政策蒐集、處理您的個人資料",
              "各第三方電商平台之隱私權政策請參閱該平台公告（蝦皮購物、酷澎等）",
              "本公司作為各該平台之賣家，得依平台規則取得必要之訂單資訊以履行契約",
            ]}
          />
        </SubSection>
      </Section>

      <Section title="智慧財產權">
        <SubSection>
          <Bullets
            items={[
              "本平台所使用之軟體、程式、網站內容，包括但不限於文字、圖片、影片、商標、網站設計等，均由本公司或其他權利人依法擁有其智慧財產權",
              "本平台展示之商品圖片、說明等內容，部分來自原廠、品牌方或第三方電商平台，其智慧財產權歸屬各該權利人",
              "任何人不得逕自使用、修改、重製、公開傳輸、散布本平台之內容",
              "違反者應對本公司及各該權利人負損害賠償責任",
            ]}
          />
        </SubSection>
      </Section>

      <Section title="免責聲明">
        <SubSection title="資訊正確性">
          <Bullets
            items={[
              "本平台展示之商品資訊僅供參考",
              "商品名稱、價格、規格、圖片等資訊力求正確，但不保證完全即時同步",
              "實際交易內容以第三方電商平台顯示為準",
              "如發現資訊有誤，請立即通知本公司",
            ]}
          />
        </SubSection>
        <SubSection title="價格與庫存變動">
          <Bullets
            items={[
              "商品價格可能因促銷活動、平台政策等因素變動",
              "本平台顯示之價格與第三方電商平台實際價格如有差異，以後者為準",
              "本平台顯示之庫存資訊僅供參考，實際庫存以第三方電商平台為準",
              "可能發生您點擊購買後發現商品已售完之情形",
            ]}
          />
        </SubSection>
        <SubSection title="第三方平台服務">
          <Bullets
            items={[
              "本公司不保證第三方電商平台（蝦皮購物、酷澎等）之系統隨時可用",
              "若第三方電商平台系統維護或故障，可能影響您的購物體驗",
              "第三方電商平台可能變更其服務條款、交易規則、付款方式等，本公司將盡力更新相關資訊，但不保證即時同步",
              "若您與第三方電商平台產生糾紛，應依該平台之爭議處理機制解決，本公司將盡力協助，但不對第三方電商平台之作為或不作為負責",
            ]}
          />
        </SubSection>
        <SubSection title="導購服務性質與賣家身分">
          <Bullets
            items={[
              "本公司僅提供導購服務，不介入交易過程、不保管款項、不直接處理配送",
              "本公司同時為第三方電商平台之賣家，交易完成後依買賣契約負履行責任",
              "交易流程（付款、配送等）依各該平台規則辦理",
            ]}
          />
        </SubSection>
        <SubSection title="責任限制">
          <Bullets
            items={[
              "本公司對於天災、戰爭、罷工、政府行為、網路或系統故障、第三方電商平台服務中斷等不可抗力因素所致之損害，不負賠償責任",
              "本公司對於第三方電商平台之系統錯誤、資料遺失、服務中斷等問題，不負賠償責任",
              "本公司如依法或依約須負賠償責任，其賠償金額以該筆交易之實收金額為上限",
            ]}
          />
        </SubSection>
      </Section>

      <Section title="條款修改與通知">
        <SubSection title="條款修改">
          <Bullets
            items={[
              "本公司有權隨時修改本服務條款",
              "修改後之條款將於本平台公告",
              "會員於修改後繼續使用本平台服務，視為同意修改後之條款",
            ]}
          />
        </SubSection>
        <SubSection title="通知方式">
          <Paragraph>
            本公司得以會員留存之聯絡方式（電子郵件、電話、簡訊、站內訊息等）進行通知。
          </Paragraph>
        </SubSection>
      </Section>

      <Section title="爭議處理與準據法">
        <SubSection title="爭議處理機制">
          <Bullets
            items={[
              "關於本平台導購服務、會員服務、資訊服務之爭議，請聯繫本公司客服",
              "關於商品交易之爭議（如商品品質、配送、退換貨等），首先可聯繫本公司客服協助處理",
              "必要時可透過第三方電商平台之爭議處理機制，或依消費者保護法等相關法令尋求救濟",
            ]}
          />
        </SubSection>
        <SubSection title="條款解釋">
          <Bullets
            items={[
              "本服務條款任一條款之全部或一部無效時，不影響其他條款之效力",
              "依消費者保護法規定，定型化契約條款如有疑義時，應為有利於消費者之解釋",
            ]}
          />
        </SubSection>
        <SubSection title="準據法與管轄法院">
          <Bullets
            items={[
              "本服務條款之解釋與適用，以中華民國法律為準據法",
              "因本服務條款所生之爭議，除法律另有強制規定外，雙方合意以台灣台北地方法院為第一審管轄法院",
            ]}
          />
        </SubSection>
      </Section>

      <Section title="公司資訊">
        <SubSection>
          <Bullets
            items={[
              "公司名稱：首爾映像有限公司",
              "代表人：朴佑濬",
              "公司地址：台北市大安區忠孝東路四段231號10樓之2",
              "客服信箱：service@seoulimage.com.tw",
              "營業時間：週一至週日 09:00-21:00",
              "統一編號：00148871",
            ]}
          />
        </SubSection>
      </Section>

      <Section title="其他重要事項">
        <SubSection title="電子文件效力">
          <Paragraph>
            您同意本平台及第三方電商平台所有交易及相關事項均得以電子文件為意思表示方法。
          </Paragraph>
        </SubSection>
        <SubSection title="交易紀錄">
          <Paragraph>
            實際交易紀錄以各第三方電商平台系統記錄為準。本平台僅保留導購點擊記錄供內部分析使用。
          </Paragraph>
        </SubSection>
        <SubSection title="契約移轉">
          <Paragraph>
            如本公司將本平台及相關業務移轉予第三人，本服務條款之權利義務關係得一併移轉。
          </Paragraph>
        </SubSection>
        <SubSection title="完整合意">
          <Paragraph>
            本服務條款構成您與本公司間關於使用本平台導購服務之完整合意。關於商品交易事項，另受第三方電商平台服務條款及相關規定約束。
          </Paragraph>
        </SubSection>
      </Section>

      <Paragraph>最後更新日期：2024年11月26日</Paragraph>
    </VStack>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && pnpm vitest run src/shared/ui/terms-of-service-content.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Lint + Commit**

```bash
cd /Users/yjlee/Documents/code/seoul-moment/seoul-moment-fe
pnpm lint:fix:web
git add apps/web/src/shared/ui/terms-of-service-content.tsx apps/web/src/shared/ui/terms-of-service-content.test.tsx
git commit -m "feat(web): add TermsOfServiceContent component"
```

---

## Task 2: 전용 페이지 `/terms`

**Files:**
- Create: `apps/web/src/views/terms/ui/TermsPage.tsx`
- Create: `apps/web/src/views/terms/index.tsx`
- Create: `apps/web/src/app/[locale]/terms/page.tsx`

- [ ] **Step 1: Create the page view**

`apps/web/src/views/terms/ui/TermsPage.tsx`:

```tsx
import { cn } from "@shared/lib/style";
import { TermsOfServiceContent } from "@shared/ui/terms-of-service-content";

export function TermsPage() {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[820px] px-[40px] pb-[100px] pt-[60px]",
        "max-sm:px-[20px] max-sm:pb-[50px] max-sm:pt-[40px]",
      )}
    >
      <TermsOfServiceContent />
    </div>
  );
}
```

- [ ] **Step 2: Create the view barrel**

`apps/web/src/views/terms/index.tsx`:

```tsx
export { TermsPage } from "./ui/TermsPage";
```

- [ ] **Step 3: Create the route entry**

`apps/web/src/app/[locale]/terms/page.tsx`:

```tsx
import { getTranslations } from "next-intl/server";

import { TermsPage } from "@views/terms";

export async function generateMetadata() {
  try {
    const t = await getTranslations();

    return {
      title: t("terms"),
    };
  } catch {
    return {};
  }
}

export default function Terms() {
  return <TermsPage />;
}
```

> 참고: `t("terms")` 키는 Task 4에서 추가한다. Task 4 이전에 `/terms`를 빌드/방문하면 next-intl이 누락 키를 키 문자열로 폴백하므로 런타임 에러는 없다(메타데이터 title이 `"terms"`로 표시될 뿐). Task 4 완료 후 정상 라벨이 적용된다.

- [ ] **Step 4: Verify route compiles**

Run: `cd apps/web && pnpm exec tsc --noEmit -p tsconfig.json`
Expected: 신규 파일 관련 타입 에러 없음 (기존 에러가 있더라도 신규 3개 파일에서 비롯된 에러가 없으면 OK).

- [ ] **Step 5: Lint + Commit**

```bash
cd /Users/yjlee/Documents/code/seoul-moment/seoul-moment-fe
pnpm lint:fix:web
git add apps/web/src/views/terms apps/web/src/app/\[locale\]/terms
git commit -m "feat(web): add /terms route and page view"
```

---

## Task 3: 모달 / 로그인 약관 링크 연결

**Files:**
- Modify: `apps/web/src/shared/ui/terms-consent.tsx`
- Modify: `apps/web/src/features/login/ui/LoginTerms.tsx`

- [ ] **Step 1: Wire TermsOfServiceContent into the terms-of-service modal**

`apps/web/src/shared/ui/terms-consent.tsx`에서 import를 추가하고, 약관 모달의 플레이스홀더 문단을 조건부 렌더로 교체한다.

먼저 파일 상단 import 블록(기존):

```tsx
import { TermsModal } from "@shared/ui/terms-modal";
```

아래에 다음 import를 추가:

```tsx
import { TermsOfServiceContent } from "@shared/ui/terms-of-service-content";
```

그리고 파일 하단의 모달 매핑부 — 기존 코드:

```tsx
      {TERM_ITEMS.map(({ key, label }) => (
        <TermsModal
          key={key}
          onOpenChange={(open) => {
            if (!open) setOpenKey(null);
          }}
          open={openKey === key}
          title={label}
        >
          <p className="text-body-3 leading-normal text-black/60">
            약관 내용입니다.
          </p>
        </TermsModal>
      ))}
```

를 다음으로 교체:

```tsx
      {TERM_ITEMS.map(({ key, label }) => (
        <TermsModal
          key={key}
          onOpenChange={(open) => {
            if (!open) setOpenKey(null);
          }}
          open={openKey === key}
          title={label}
        >
          {key === "termsOfService" ? (
            <TermsOfServiceContent />
          ) : (
            <p className="text-body-3 leading-normal text-black/60">
              약관 내용입니다.
            </p>
          )}
        </TermsModal>
      ))}
```

- [ ] **Step 2: Link LoginTerms to /terms**

`apps/web/src/features/login/ui/LoginTerms.tsx` 전체를 다음으로 교체:

```tsx
"use client";

import { Link } from "@/i18n/navigation";

import { cn, VStack } from "@seoul-moment/ui";

export function LoginTerms() {
  return (
    <VStack className="w-full pt-[20px]" gap={10}>
      <p
        className={cn(
          "text-body-3 w-full text-center leading-none text-black/80",
          "max-md:text-body-4",
        )}
      >
        登入帳號，即表示您已閱讀並同意 SEOUL MOMONET
      </p>
      <Link
        className={cn(
          "text-body-3 w-full cursor-pointer text-center leading-none text-black/60 underline",
          "max-sm:text-body-4",
        )}
        href="/terms"
      >
        會員條款 與 客戶隱私權條款
      </Link>
    </VStack>
  );
}
```

- [ ] **Step 3: Verify existing terms-consent test still passes (if any) + typecheck**

Run: `cd apps/web && pnpm exec tsc --noEmit -p tsconfig.json`
Expected: 신규/수정 파일 관련 타입 에러 없음.

(참고: `terms-consent`/`LoginTerms` 전용 테스트는 현재 없으므로 추가 단위 테스트는 생략한다. 본문 렌더는 Task 1 테스트로 커버됨.)

- [ ] **Step 4: Lint + Commit**

```bash
cd /Users/yjlee/Documents/code/seoul-moment/seoul-moment-fe
pnpm lint:fix:web
git add apps/web/src/shared/ui/terms-consent.tsx apps/web/src/features/login/ui/LoginTerms.tsx
git commit -m "feat(web): surface terms of service in signup modal and login link"
```

---

## Task 4: Footer 링크 + i18n `terms` 키

**Files:**
- Modify: `apps/web/src/i18n/messages/zh-TW.json`
- Modify: `apps/web/src/i18n/messages/ko.json`
- Modify: `apps/web/src/i18n/messages/en.json`
- Modify: `apps/web/src/widgets/footer/ui/Footer.tsx`

- [ ] **Step 1: Add `terms` key to zh-TW messages**

`apps/web/src/i18n/messages/zh-TW.json` — 기존 라인:

```json
  "policy": "關於策略",
```

바로 아래에 추가:

```json
  "terms": "服務條款",
```

- [ ] **Step 2: Add `terms` key to ko messages**

`apps/web/src/i18n/messages/ko.json` — 기존 라인:

```json
  "policy": "Policy",
```

바로 아래에 추가:

```json
  "terms": "Terms",
```

- [ ] **Step 3: Add `terms` key to en messages**

`apps/web/src/i18n/messages/en.json` — 기존 라인:

```json
  "policy": "Policy",
```

바로 아래에 추가:

```json
  "terms": "Terms",
```

- [ ] **Step 4: Add the /terms link to Footer**

`apps/web/src/widgets/footer/ui/Footer.tsx` — 기존 코드:

```tsx
              <Link href="/about">{t("about")}</Link>
              <Link href="/contact">{t("contact")}</Link>
              <Link href="/policy">{t("policy")}</Link>
```

를 다음으로 교체 (기존 `/policy` 유지 + `/terms` 추가):

```tsx
              <Link href="/about">{t("about")}</Link>
              <Link href="/contact">{t("contact")}</Link>
              <Link href="/policy">{t("policy")}</Link>
              <Link href="/terms">{t("terms")}</Link>
```

- [ ] **Step 5: Verify build/typecheck and i18n key resolution**

Run: `cd apps/web && pnpm exec tsc --noEmit -p tsconfig.json`
Expected: 타입 에러 없음.

Run: `cd /Users/yjlee/Documents/code/seoul-moment/seoul-moment-fe && node -e "['zh-TW','ko','en'].forEach(l=>{const m=require('./apps/web/src/i18n/messages/'+l+'.json'); if(!m.terms) throw new Error('missing terms in '+l); console.log(l, '->', m.terms)})"`
Expected: 각 로케일의 `terms` 값 출력 (`zh-TW -> 服務條款`, `ko -> Terms`, `en -> Terms`).

- [ ] **Step 6: Lint + Commit**

```bash
cd /Users/yjlee/Documents/code/seoul-moment/seoul-moment-fe
pnpm lint:fix:web
git add apps/web/src/i18n/messages/zh-TW.json apps/web/src/i18n/messages/ko.json apps/web/src/i18n/messages/en.json apps/web/src/widgets/footer/ui/Footer.tsx
git commit -m "feat(web): add terms footer link and i18n label key"
```

---

## 최종 검증

- [ ] **전체 단위 테스트**

Run: `cd apps/web && pnpm vitest run src/shared/ui/terms-of-service-content.test.tsx`
Expected: PASS.

- [ ] **수동 확인 (dev 서버)**

Run: `pnpm dev:web` 후 브라우저에서:
1. `http://localhost:3000/zh-TW/terms` — 약관 전문 노출, 12개 섹션 제목 표시
2. 회원가입 화면(`/zh-TW/signup`) → 약관 동의의 `Terms of Service` "자세히" → 모달에 약관 전문 노출 (스크롤 동작)
3. 로그인 화면(`/zh-TW/login`) → `會員條款 與 客戶隱私權條款` 링크 클릭 → `/terms` 이동
4. Footer에 약관(`服務條款`) 링크 노출 및 클릭 시 `/terms` 이동

---

## 비고

- i18n 메시지는 Google Sheets에서 동기화(`pnpm i18n:sync`)되므로, 로컬에 추가한 `terms` 키는 다음 동기화 시 덮어쓰일 수 있다. 시트에도 `terms` 키(zh-TW: `服務條款`)를 등록해 팀과 공유할 것.
- Privacy Policy(隱私權政策) 원문 확보 시 동일 패턴으로 `PrivacyPolicyContent`를 추가하고 `terms-consent.tsx`의 `privacyPolicy` 분기에 연결한다.
- ko/en 약관 번역본 확보 시, `TermsOfServiceContent`를 로케일 분기 또는 i18n 기반으로 전환할 수 있다(현 구조는 본문 컴포넌트 교체만으로 확장 가능).
