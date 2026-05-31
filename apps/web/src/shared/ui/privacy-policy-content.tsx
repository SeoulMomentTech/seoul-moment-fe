import type { ReactNode } from "react";

import {
  Bullets,
  LegalDocument,
  Paragraph,
  Section,
  SubSection,
} from "@shared/ui/legal-document";

export function PrivacyPolicyContent(): ReactNode {
  return (
    <LegalDocument title="首爾映像有限公司 隱私權政策">
      <Section title="前言">
        <Paragraph>
          首爾映像有限公司（以下簡稱「本公司」、「我們」）重視您的隱私權，並致力於保護您的個人資料。本隱私權政策說明本公司如何蒐集、處理、利用及保護您於使用首爾映像購物平台（www.seoulmoment.com.tw，以下簡稱「本平台」）時所提供之個人資料。
        </Paragraph>
        <Paragraph>
          當您使用本平台服務時，即表示您已閱讀、瞭解並同意本隱私權政策之所有內容。
        </Paragraph>
      </Section>

      <Section title="個人資料保護法告知事項">
        <Paragraph>
          依據個人資料保護法第8條及第9條規定，本公司向您告知以下事項：
        </Paragraph>
        <SubSection title="蒐集之目的">
          <Paragraph>本公司蒐集您的個人資料，目的包括但不限於：</Paragraph>
          <Bullets
            items={[
              "導購服務提供（個資法特定目的代號：069 契約、類似契約或其他法律關係事務）：提供商品資訊展示服務、處理會員註冊與管理、提供個人化商品推薦、網站功能運作與優化",
              "客戶服務與溝通（個資法特定目的代號：090 消費者、客戶管理與服務）：回應您的詢問與客訴、提供售後服務與協助、處理退換貨相關事宜、進行滿意度調查",
              "行銷推廣（個資法特定目的代號：040 行銷）：提供促銷活動資訊、寄送電子報及會員優惠訊息、會員權益通知、市場調查與分析",
              "履行法定義務（個資法特定目的代號：069 契約、類似契約或其他法律關係事務）：配合司法機關或主管機關依法調查、履行消費者保護法等相關法令義務",
              "網站管理與資訊安全（個資法特定目的代號：148 網路購物及其他電子商務服務）：維護網站系統安全、防止詐欺或其他不法行為、流量分析與網站使用行為研究",
            ]}
          />
        </SubSection>
        <SubSection title="蒐集之個人資料類別">
          <Paragraph>本公司可能蒐集以下類別之個人資料：</Paragraph>
          <Bullets
            items={[
              "識別資料（C001）：姓名、行動電話號碼、電子郵件信箱、會員帳號",
              "特徵資料（C011）：性別、出生年月日、年齡區間",
              "社會情況（C035）：興趣、嗜好、購物偏好",
              "網路使用資訊：IP位址、Cookie資訊、瀏覽器類型、裝置資訊、瀏覽紀錄、點擊紀錄",
              "其他資料：您主動提供之其他資料",
            ]}
          />
        </SubSection>
        <SubSection title="個人資料利用之期間、地區、對象及方式">
          <Bullets
            items={[
              "利用期間：會員資格存續期間、本公司營業期間、依相關法令規定之保存期間，或經您同意之特定期間",
              "利用地區：中華民國境內、本公司業務往來之國家或地區",
              "利用對象：本公司及本公司委託處理個人資料之受託者、與本公司有業務往來之合作夥伴、依法有權要求提供之政府機關或司法機關",
              "利用方式：以自動化或非自動化方式進行蒐集、處理及利用；包括但不限於資料建檔、傳輸、儲存、查詢、修改、刪除等",
            ]}
          />
        </SubSection>
        <SubSection title="您的權利">
          <Paragraph>
            依據個人資料保護法第3條規定，您就您的個人資料享有以下權利：
          </Paragraph>
          <Bullets
            items={[
              "查詢或請求閱覽",
              "請求製給複製本",
              "請求補充或更正",
              "請求停止蒐集、處理或利用",
              "請求刪除",
            ]}
          />
          <Paragraph>您可依本政策第九條所載方式行使上述權利。</Paragraph>
        </SubSection>
        <SubSection title="您不提供個人資料之影響">
          <Paragraph>若您選擇不提供個人資料，可能導致：</Paragraph>
          <Bullets
            items={[
              "無法完成會員註冊",
              "無法使用需登入之功能",
              "無法接收會員專屬優惠資訊",
              "無法享有完整之客戶服務",
            ]}
          />
          <Paragraph>您仍可瀏覽本平台之公開資訊。</Paragraph>
        </SubSection>
      </Section>

      <Section title="個人資料之蒐集方式">
        <Paragraph>本公司透過以下方式蒐集您的個人資料：</Paragraph>
        <SubSection title="您主動提供">
          <Bullets
            items={[
              "會員註冊：填寫會員註冊表單時提供之資料",
              "使用服務：使用客服系統、填寫表單、參加活動時提供之資料；訂閱電子報時提供之資料；填寫問卷調查時提供之資料",
              "聯繫本公司：透過電話、電子郵件、線上客服等方式聯繫時提供之資料",
            ]}
          />
        </SubSection>
        <SubSection title="自動蒐集">
          <Paragraph>當您瀏覽本平台時，系統自動記錄之資訊，包括：</Paragraph>
          <Bullets
            items={[
              "IP位址",
              "瀏覽器類型及版本",
              "作業系統",
              "訪問時間",
              "瀏覽頁面",
              "點擊行為",
              "Cookie及類似技術（詳見本政策第六條說明）",
            ]}
          />
        </SubSection>
        <SubSection title="合法來源">
          <Paragraph>
            從合法來源取得之公開資訊或經您同意之第三方提供之資料。
          </Paragraph>
        </SubSection>
      </Section>

      <Section title="個人資料之利用與分享">
        <SubSection title="本公司內部利用">
          <Paragraph>
            本公司將在前述蒐集目的範圍內利用您的個人資料，包括但不限於：
          </Paragraph>
          <Bullets
            items={[
              "提供及改善本平台服務",
              "進行會員管理",
              "客戶服務與溝通",
              "行銷推廣活動",
              "資料分析與統計",
            ]}
          />
        </SubSection>
        <SubSection title="與第三方分享">
          <Paragraph>
            本公司可能在下列情況下與第三方分享您的個人資料：
          </Paragraph>
          <Bullets
            items={[
              "第三方電商平台：本平台為導購平台，點擊購買連結後將導向第三方電商平台（包括但不限於蝦皮購物、酷澎等）完成交易；可能透過網址參數或其他技術傳遞必要資訊；本公司作為賣家將依平台規則取得必要訂單資訊（如姓名、電話、地址等）以履行交易；第三方平台對個資之處理依各該平台隱私權政策辦理",
              "服務提供商：網站託管、客戶服務、電子郵件、數據分析、雲端服務、行銷服務等供應商；本公司僅在必要範圍內提供，並要求其遵守保密義務及相關法令規定",
              "廣告及分析合作夥伴：與廣告平台（如Google Ads、Facebook Ads、LINE Ads）、網站分析工具（如Google Analytics）、社群媒體平台分享去識別化或匿名化之資料",
              "法律要求或保護權益：依法令規定或司法、檢調機關之要求；為保護本公司、其他使用者或公眾之權利、財產或安全；為防止詐欺、安全威脅或違法行為；執行本服務條款或本隱私權政策",
              "企業交易：如本公司進行合併、收購、出售資產或其他企業交易，您的個人資料可能作為交易之一部分移轉予承接方；本公司將事前通知您，並確保承接方遵守本隱私權政策或提供同等保護",
            ]}
          />
        </SubSection>
        <SubSection title="不會分享之情況">
          <Paragraph>
            除前述情況外，未經您的明確同意，本公司不會將您的個人資料出售、出租或以其他方式提供予第三方。
          </Paragraph>
        </SubSection>
      </Section>

      <Section title="個人資料之保護措施">
        <Paragraph>
          本公司重視個人資料之安全，採取以下措施保護您的個人資料：
        </Paragraph>
        <SubSection title="技術措施">
          <Bullets
            items={[
              "加密技術：使用SSL/TLS加密技術保護資料傳輸、對敏感資料進行加密儲存",
              "存取控制：實施嚴格的存取權限管理、僅授權人員得存取個人資料、採用多因素認證機制",
              "防火牆及入侵偵測：部署防火牆保護系統、建置入侵偵測及防禦系統、定期進行安全性檢測",
              "資料備份：定期備份重要資料、建立災難復原機制",
            ]}
          />
        </SubSection>
        <SubSection title="管理措施">
          <Bullets
            items={[
              "內部政策與程序：制定個人資料保護管理辦法、建立個人資料事故應變程序、定期審視及更新安全措施",
              "人員管理：與員工簽訂保密協議、提供個人資料保護教育訓練、限制個人資料之存取權限",
              "委外管理：與委外廠商簽訂個人資料保護契約、要求採取適當安全措施、定期稽核委外廠商之執行情形",
            ]}
          />
        </SubSection>
        <SubSection title="您應配合之事項">
          <Paragraph>為保護您的個人資料安全，您應：</Paragraph>
          <Bullets
            items={[
              "妥善保管您的帳號及密碼，不提供予他人",
              "使用完畢後請登出會員",
              "不在公共電腦或不安全的網路環境下登入",
              "定期更換密碼",
              "如發現帳號遭盜用，立即通知本公司",
            ]}
          />
        </SubSection>
        <SubSection title="安全限制說明">
          <Paragraph>
            儘管本公司已採取前述安全措施，但網際網路環境本身存在不可預測之風險，本公司無法保證資料傳輸之絕對安全。您瞭解並同意透過網際網路傳輸資料存在一定風險。
          </Paragraph>
        </SubSection>
      </Section>

      <Section title="個人資料之保存與刪除">
        <SubSection title="保存期間">
          <Bullets
            items={[
              "會員資格存續期間：您為本平台會員期間，本公司將保存您的個人資料",
              "帳戶註銷後：原則上將於30日內刪除或匿名化您的個人資料；但以下資料可能基於合法理由繼續保存：依法令規定應保存之資料（如交易記錄、發票資訊等）、為處理尚未完結之交易或爭議所必要之資料、經去識別化處理之統計資料",
              "法令規定期間：依稅捐稽徵法、商業會計法、消費者保護法等相關法令規定應保存之資料，保存至法定期間屆滿",
              "其他特定期間：經您同意之特定保存期間、為履行契約或法律義務所必要之期間",
            ]}
          />
        </SubSection>
        <SubSection title="刪除方式">
          <Bullets
            items={[
              "安全刪除：採用安全刪除技術，確保資料無法復原；對實體儲存媒體進行適當銷毀",
              "去識別化或匿名化：對於基於統計、分析目的保存之資料，將去除可識別個人之資訊",
            ]}
          />
        </SubSection>
        <SubSection title="註銷會員帳號">
          <Paragraph>
            您可依本政策第九條所載方式申請註銷會員帳號。註銷後：
          </Paragraph>
          <Bullets
            items={[
              "您將無法再使用該帳號登入",
              "該帳號之會員權益將失效",
              "您的個人資料將依前述規定處理",
            ]}
          />
        </SubSection>
      </Section>

      <Section title="Cookie及類似技術">
        <SubSection title="Cookie說明">
          <Paragraph>
            Cookie是網站傳送至您瀏覽器並儲存於您電腦或行動裝置的小型文字檔案。本平台使用Cookie及類似技術以改善您的使用體驗。
          </Paragraph>
        </SubSection>
        <SubSection title="Cookie之用途">
          <Paragraph>本平台使用Cookie的目的包括：</Paragraph>
          <Bullets
            items={[
              "必要性Cookie（無法關閉）：維持網站基本功能運作、辨識會員登入狀態、記住您的偏好設定、保護網站及使用者安全",
              "功能性Cookie：記住您的語言偏好、記住您的瀏覽偏好、提供個人化內容",
              "效能分析Cookie：分析網站流量及使用情況、瞭解使用者如何使用網站、改善網站功能及使用者體驗（本平台使用Google Analytics進行網站分析）",
              "行銷Cookie：追蹤您的瀏覽行為、提供個人化廣告內容、評估廣告效益（本平台可能使用Google Ads、Facebook Pixel等追蹤工具）",
            ]}
          />
        </SubSection>
        <SubSection title="第三方Cookie">
          <Paragraph>本平台可能使用以下第三方Cookie：</Paragraph>
          <Bullets
            items={[
              "Google Analytics — 用途：網站流量分析；隱私權政策：https://policies.google.com/privacy",
              "Google Ads / Google Tag Manager — 用途：廣告投放及轉換追蹤；隱私權政策：https://policies.google.com/privacy",
              "Facebook Pixel — 用途：廣告投放及成效追蹤；隱私權政策：https://www.facebook.com/privacy/",
              "LINE Tag — 用途：廣告投放及成效追蹤；隱私權政策：https://terms.line.me/line_rules/",
            ]}
          />
        </SubSection>
        <SubSection title="管理Cookie">
          <Paragraph>您可透過以下方式管理Cookie：</Paragraph>
          <Bullets
            items={[
              "瀏覽器設定：大多數瀏覽器預設接受Cookie，您可變更設定以拒絕Cookie；您可刪除已儲存在裝置上的Cookie；設定方式請參考您的瀏覽器說明",
              "第三方退出機制：Google Ads退出 https://adssettings.google.com/、Facebook廣告偏好 https://www.facebook.com/ads/preferences/、數位廣告聯盟退出 http://optout.aboutads.info/",
              "本平台Cookie管理工具：您可於本平台之Cookie設定頁面管理非必要性Cookie",
            ]}
          />
          <Paragraph>
            注意事項：如您禁用Cookie，可能影響網站功能及使用體驗；部分服務可能無法正常運作；您仍可瀏覽本平台之公開內容。
          </Paragraph>
        </SubSection>
      </Section>

      <Section title="您的權利與行使方式">
        <SubSection title="您的權利">
          <Paragraph>
            依據個人資料保護法，您就您的個人資料享有以下權利：
          </Paragraph>
          <Bullets
            items={[
              "查詢或請求閱覽：您有權查詢或請求閱覽您的個人資料",
              "請求製給複製本：您有權請求本公司提供您個人資料之複製本",
              "請求補充或更正：若您的個人資料有錯誤或不完整，您可請求補充或更正",
              "請求停止蒐集、處理或利用：您可請求本公司停止蒐集、處理或利用您的個人資料",
              "請求刪除：您可請求本公司刪除您的個人資料",
            ]}
          />
        </SubSection>
        <SubSection title="行使方式">
          <Paragraph>您可透過以下方式行使前述權利：</Paragraph>
          <Bullets
            items={[
              "線上操作：登入會員中心，於「個人資料管理」頁面自行查詢、修改或刪除",
              "書面申請：下載「個人資料當事人權利行使申請書」（可於本平台下載），填妥後連同身分證明文件影本寄至：臺北市大安區忠孝東路4段231號10樓之2 首爾映像有限公司 客服部 收",
              "電子郵件：寄送申請至客服信箱，主旨請註明「行使個人資料當事人權利」，並檢附身分證明文件掃描檔",
              "客服電話：撥打客服專線（02）xxxx-xxxx，服務時間 週一至週日 09:00-21:00，客服人員將協助您進行申請",
            ]}
          />
        </SubSection>
        <SubSection title="身分驗證">
          <Paragraph>為保護您的個人資料安全，本公司將進行身分驗證：</Paragraph>
          <Bullets
            items={[
              "您需提供足以確認身分之資料或文件",
              "本公司有權要求您提供額外資訊以確認身分",
              "若無法確認您的身分，本公司得拒絕您的請求",
            ]}
          />
        </SubSection>
        <SubSection title="處理期間">
          <Bullets
            items={[
              "本公司將於收到您的申請後15日內回覆",
              "如需延長處理期間，將事先通知您延長之理由及期限",
            ]}
          />
        </SubSection>
        <SubSection title="註銷會員帳號">
          <Paragraph>
            您可申請註銷會員帳號，本公司將依本政策第五條規定處理您的個人資料。
          </Paragraph>
          <Paragraph>
            注意事項：註銷後無法復原；相關權益將同時失效；依法應保存之資料仍將繼續保存。
          </Paragraph>
        </SubSection>
      </Section>

      <Section title="隱私權政策之變更">
        <SubSection title="變更權利">
          <Paragraph>本公司保留隨時修改本隱私權政策之權利。</Paragraph>
        </SubSection>
        <SubSection title="變更通知">
          <Paragraph>
            當本隱私權政策有重大變更時，本公司將透過以下方式通知您：
          </Paragraph>
          <Bullets
            items={[
              "於本平台顯著位置公告",
              "發送電子郵件通知",
              "發送站內訊息",
              "其他適當方式",
            ]}
          />
        </SubSection>
        <SubSection title="變更生效">
          <Bullets
            items={[
              "修改後之隱私權政策將於本平台公告後生效",
              "重大變更可能設定較長之生效期間，讓您有足夠時間審閱",
            ]}
          />
        </SubSection>
        <SubSection title="您的選擇">
          <Paragraph>若您不同意變更後之隱私權政策：</Paragraph>
          <Bullets
            items={[
              "您可選擇停止使用本平台服務",
              "您可申請註銷會員帳號",
              "您繼續使用本平台服務，視為同意變更後之政策",
            ]}
          />
        </SubSection>
        <SubSection title="查閱歷史版本">
          <Paragraph>您可於本平台查閱本隱私權政策之歷史版本。</Paragraph>
        </SubSection>
      </Section>

      <Section title="聯繫我們">
        <Paragraph>
          如您對本隱私權政策或個人資料保護有任何疑問、意見或申訴，請透過以下方式聯繫我們：
        </Paragraph>
        <SubSection title="聯絡資訊">
          <Bullets
            items={[
              "首爾映像有限公司",
              "客服電話：（02）xxxx-xxxx",
              "服務時間：週一至週日 09:00-21:00",
              "通訊地址：臺北市大安區忠孝東路4段231號10樓之2",
            ]}
          />
        </SubSection>
      </Section>

      <Paragraph>最後更新日期：2024年11月26日</Paragraph>
    </LegalDocument>
  );
}
