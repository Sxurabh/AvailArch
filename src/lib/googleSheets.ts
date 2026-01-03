import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// Initialize Auth
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export const doc = new GoogleSpreadsheet(
  process.env.GOOGLE_SHEET_ID!,
  serviceAccountAuth
);

export async function getSheetData(title: "Requests" | "Projects") {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[title];
  const rows = await sheet.getRows();
  return rows.map((row) => {
    const obj: any = {};
    row.table.headerValues.forEach((header) => {
      obj[header] = row.get(header);
    });
    return obj;
  });
}

export async function addRow(title: "Requests" | "Projects", data: any) {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[title];
  await sheet.addRow(data);
}