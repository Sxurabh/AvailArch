// src/app/api/projects/route.ts
import { NextResponse } from "next/server";
import { getSheetData, addRow } from "@/lib/googleSheets";

// 🟢 GET: Fetch All Projects
export async function GET() {
  try {
    const projects = await getSheetData("Projects");
    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET Projects Error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// 🟢 POST: Create New Project
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Generate a new ID if one isn't provided (Create mode)
    // We use a timestamp-based ID for simplicity
    const newId = body.id || Date.now().toString();
    
    await addRow("Projects", { ...body, id: newId });
    
    return NextResponse.json({ success: true, mode: "create", id: newId });

  } catch (error) {
    console.error("POST Project Error:", error);
    return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
  }
}