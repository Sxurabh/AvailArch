import { google } from "googleapis";

export async function getFormResponses() {
  try {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
    const sheetId = process.env.GOOGLE_FORM_SHEET_ID;

    if (!clientEmail || !privateKey || !sheetId) {
      console.error("❌ Missing Google Sheets credentials in .env");
      return { headers: [], data: [] };
    }

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 1. Get all sheet names (tabs)
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const sheetsList = meta.data.sheets || [];

    // 2. Find the tab named "Form responses" (or "Form Responses 1")
    let targetSheet = sheetsList.find(
      (s: any) => s.properties?.title?.trim() === "Form responses"
    );

    if (!targetSheet) {
      targetSheet = sheetsList.find(
        (s: any) => s.properties?.title?.trim() === "Form Responses 1"
      );
    }

    // Fallback to first sheet if specific name not found
    if (!targetSheet) {
      console.warn("⚠️ Could not find 'Form responses' tab, defaulting to first tab.");
      targetSheet = sheetsList[0];
    }

    const sheetTitle = targetSheet?.properties?.title;

    if (!sheetTitle) {
      return { headers: [], data: [] };
    }

    console.log(`✅ Fetching data from tab: "${sheetTitle}"`);

    // 3. Fetch data from that specific tab
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: sheetTitle,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return { headers: [], data: [] };
    }

    // Process headers and data
    const headers = rows[0];
    const data = rows.slice(1).reverse();

    return { headers, data };

  } catch (error: any) {
    console.error("❌ Google Sheets API Error:", error.message);
    return { headers: [], data: [] };
  }
}