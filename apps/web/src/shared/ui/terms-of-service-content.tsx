import type { ReactNode } from "react";

import {
  Bullets,
  LegalDocument,
  Paragraph,
  Section,
  SubSection,
} from "@shared/ui/legal-document";

export function TermsOfServiceContent(): ReactNode {
  return (
    <LegalDocument title="首爾映像有限公司 平台服務條款">
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
    </LegalDocument>
  );
}
