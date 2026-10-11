const fs = require("fs/promises");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { JWT } = require("google-auth-library");
const { google } = require("googleapis");

const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
if (!serviceAccountJson) {
  throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON env is required");
}
const account = JSON.parse(serviceAccountJson);
if (account.private_key) {
  account.private_key = account.private_key.replace(/\\n/g, "\n");
}

const RANGE = "language-pack!A1:D"; // 필요 범위 지정
const GOOGLE_SHEET_ID = "1oEXsVhu6U5HVLmwfR2LIQLc43yBgiGhn_bUpXBVNJiE"; //"YOUR_GOOGLE_SHEET_ID";
/**
 * 시트 한 장이 웹과 모바일의 언어팩을 함께 먹인다 — 두 앱이 같은 화면을 다른 말로
 * 부르면 같은 제품으로 보이지 않는다. 각 앱이 제 안에 사본을 들고 있는 이유는 빌드다:
 * next build 도 metro 도 이 스크립트를 돌리지 않으므로, 커밋된 JSON 이 빌드의 입력이다.
 */
const BASE_PATHS = [
  path.resolve(__dirname, "../src/i18n/messages"),
  path.resolve(__dirname, "../../mobile/src/shared/lib/i18n/messages"),
];

const loadGoogleSheet = async () => {
  const auth = new JWT({
    email: account.client_email,
    key: account.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: RANGE,
  });

  return res.data.values;
};

async function generateLocaleFiles() {
  const values = await loadGoogleSheet();
  if (!values || values.length === 0) {
    console.error("❌ No data found in sheet");
    return;
  }

  const [headers, ...rows] = values;
  const keyIndex = 0;

  const dataByLang = {};

  for (const row of rows) {
    const key = row[keyIndex];
    if (!key) continue;

    for (let i = 1; i < headers.length; i++) {
      const lang = headers[i];
      const value = row[i] || "";

      if (!dataByLang[lang]) dataByLang[lang] = {};
      dataByLang[lang][key] = value;
    }
  }

  for (const basePath of BASE_PATHS) {
    await fs.mkdir(basePath, { recursive: true });

    for (const [lang, data] of Object.entries(dataByLang)) {
      const filePath = path.join(basePath, `${lang}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    }

    console.log(`✅ ${path.relative(process.cwd(), basePath)} 생성 완료`);
  }

  console.log(`✅ 번역 최신화 완료`);
}

generateLocaleFiles();
