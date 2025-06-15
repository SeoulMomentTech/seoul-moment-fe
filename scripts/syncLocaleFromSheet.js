const fs = require("fs/promises");
const path = require("path");

const { JWT } = require("google-auth-library");
const { google } = require("googleapis");
const account = require("./account.json");

const RANGE = "language-pack!A1:D"; // 필요 범위 지정
const GOOGLE_SHEET_ID = "1oEXsVhu6U5HVLmwfR2LIQLc43yBgiGhn_bUpXBVNJiE"; //"YOUR_GOOGLE_SHEET_ID";
const BASE_PATH = path.resolve(__dirname, "../src/i18n/messages");

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

  await fs.mkdir(BASE_PATH, { recursive: true });

  for (const [lang, data] of Object.entries(dataByLang)) {
    const filePath = path.join(BASE_PATH, `${lang}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`✅ ${lang}.json 생성 완료`);
  }

  console.log(`✅ 번역 최신화 완료`);
}

generateLocaleFiles();
