// src/lib/googleSheets.ts
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
  if (!sheet) throw new Error(`Sheet '${title}' not found.`);

  const rows = await sheet.getRows();
  return rows.map((row) => {
    const rowData = row.toObject();
    if (rowData.id) rowData.id = String(rowData.id);
    return rowData;
  });
}

export async function addRow(title: "Requests" | "Projects", data: any) {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[title];
  if (!sheet) throw new Error(`Sheet '${title}' not found.`);
  await sheet.addRow(data);
}

// 🟢 NEW: Update a row by ID
export async function updateRow(title: "Projects", id: string, data: any) {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[title];
  const rows = await sheet.getRows();
  
  // Find the row where the 'id' column matches
  const row = rows.find((r) => r.get("id") === id);
  
  if (!row) throw new Error(`Row with ID ${id} not found.`);
  
  // Update fields
  row.assign(data);
  await row.save();
}

// 🟢 NEW: Delete a row by ID
export async function deleteRow(title: "Projects", id: string) {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[title];
  const rows = await sheet.getRows();

  const row = rows.find((r) => r.get("id") === id);
  
  if (!row) throw new Error(`Row with ID ${id} not found.`);
  
  await row.delete();
}