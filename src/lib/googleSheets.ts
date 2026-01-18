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

// --- HELPER 1: Convert App Data (Arrays) -> Sheet Data (Strings) ---
const serializeProjectData = (data: any) => {
  const serialized = { ...data };
  // These fields are arrays/objects in the app, but must be strings in the Sheet
  const complexFields = ["sections", "spaces", "gallery", "heroImages"];
  
  complexFields.forEach((field) => {
    // If field exists and is NOT a string (it's an array), convert to JSON string
    if (serialized[field] && typeof serialized[field] !== "string") {
      serialized[field] = JSON.stringify(serialized[field]);
    }
  });
  return serialized;
};

// --- HELPER 2: Convert Sheet Data (Strings) -> App Data (Arrays) ---
const parseProjectData = (row: any) => {
    // Convert Google Sheet Row to a plain JS Object
    const data = row.toObject ? row.toObject() : { ...row };
    
    // Ensure ID is a string
    if (data.id) data.id = String(data.id);
    
    // Fields that need to be parsed back from JSON strings
    const complexFields = ["sections", "spaces", "gallery", "heroImages"];
    
    complexFields.forEach((field) => {
        if (data[field]) {
            try {
                // Only parse if it looks like a JSON array/object (starts with [ or {)
                if (typeof data[field] === 'string' && (data[field].startsWith("[") || data[field].startsWith("{"))) {
                     data[field] = JSON.parse(data[field]);
                }
            } catch (e) {
                console.warn(`⚠️ Failed to parse field '${field}' for project ${data.id}. Keeping as is.`);
            }
        }
    });
    return data;
}

// --- MAIN FUNCTIONS ---

export async function getSheetData(title: "Requests" | "Projects") {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[title];
  if (!sheet) throw new Error(`Sheet '${title}' not found.`);

  const rows = await sheet.getRows();
  
  // Use the helper to parse JSON strings back into Arrays
  return rows.map(parseProjectData);
}

export async function addRow(title: "Requests" | "Projects", data: any) {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[title];
  if (!sheet) throw new Error(`Sheet '${title}' not found.`);
  
  // Serialize arrays to strings before saving (Only for Projects)
  const dataToSave = title === "Projects" ? serializeProjectData(data) : data;
  
  await sheet.addRow(dataToSave);
}

export async function updateRow(title: "Projects", id: string, data: any) {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[title];
  const rows = await sheet.getRows();
  
  const row = rows.find((r) => r.get("id") === id);
  if (!row) throw new Error(`Row with ID ${id} not found.`);
  
  // Serialize arrays to strings before updating
  const dataToSave = serializeProjectData(data);
  
  row.assign(dataToSave);
  await row.save();
}

export async function deleteRow(title: "Projects", id: string) {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[title];
  const rows = await sheet.getRows();

  const row = rows.find((r) => r.get("id") === id);
  if (!row) throw new Error(`Row with ID ${id} not found.`);
  
  await row.delete();
}