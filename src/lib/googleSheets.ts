import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// Initialize Auth
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  // Handle escaped newlines in the key string
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
  
  if (!sheet) {
    throw new Error(`Sheet with title '${title}' not found. Please check your Google Sheet tabs.`);
  }

  const rows = await sheet.getRows();

  // 🟢 FIX: Use .toObject() instead of manual iteration
  return rows.map((row) => {
    const rowData = row.toObject();
    // Start ensuring the ID is always a string if it exists
    if (rowData.id) {
        rowData.id = String(rowData.id);
    }
    return rowData;
  });
}

export async function addRow(title: "Requests" | "Projects", data: any) {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[title];
  if (!sheet) {
    throw new Error(`Sheet with title '${title}' not found.`);
  }
  await sheet.addRow(data);
}